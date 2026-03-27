"""
SehatAI - ML Flask API Server
==============================
Run this AFTER you've trained the model (train.py).
This server accepts X-Ray images from the SehatAI React app
and returns predictions from the trained custom ML model.

HOW TO RUN:
  > cd ml_server
  > venv\\Scripts\\activate     (Windows)
  > python server.py

Server starts at: http://localhost:5001/analyze-xray
"""

import os
import io
import base64
import torch
import torch.nn as nn
from torchvision import transforms, models
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import timm

# ── CONFIG ────────────────────────────────────────────────────────────────────
MODEL_DIR   = os.path.join(os.path.dirname(__file__), "model")
DEVICE      = "cuda" if torch.cuda.is_available() else "cpu"

# ── FLASK APP ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)   # Allow requests from React app (localhost:5173)

# ── LAZY MODEL LOADING (load on-demand to save RAM on free tier) ──────────────
MODELS = {}  # Cache once loaded

def load_model(model_key):
    """Load a single model by key, cache it, return it."""
    if model_key in MODELS:
        return MODELS[model_key]

    # Try exact name or with _model suffix
    candidates = [model_key, f"{model_key}_model"]
    path = None
    for name in candidates:
        candidate_path = os.path.join(MODEL_DIR, f"{name}.pth")
        if os.path.exists(candidate_path):
            path = candidate_path
            model_key = name
            break

    if not path:
        return None

    try:
        checkpoint = torch.load(path, map_location=DEVICE, weights_only=False)
        classes = checkpoint.get("class_names", checkpoint.get("classes", []))
        model_name = checkpoint.get("model_name", "densenet121").lower()

        if "efficientnet" in model_name:
            net = timm.create_model(model_name, pretrained=False, num_classes=len(classes))
        else:
            hidden_size = 256
            if "model_state_dict" in checkpoint and "classifier.0.weight" in checkpoint["model_state_dict"]:
                hidden_size = checkpoint["model_state_dict"]["classifier.0.weight"].size(0)
            net = models.densenet121(weights=None)
            net.classifier = nn.Sequential(
                nn.Linear(net.classifier.in_features, hidden_size),
                nn.ReLU(),
                nn.Dropout(0.4),
                nn.Linear(hidden_size, len(classes))
            )

        state = checkpoint.get("model_state_dict", checkpoint.get("state_dict"))
        net.load_state_dict(state)
        net.eval().to(DEVICE)

        MODELS[model_key] = {
            "net": net,
            "classes": classes,
            "name": model_key.replace("_model", "").upper()
        }
        print(f"✅ Loaded on demand: {model_key} ({len(classes)} classes)")
        return MODELS[model_key]
    except Exception as e:
        print(f"❌ Failed to load {model_key}: {e}")
        return None

# ── IMAGE PREPROCESSING ───────────────────────────────────────────────────────
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ── ROUTES ────────────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def index():
    return '''
    <h1>✅ SehatAI Machine Learning Server is Running!</h1>
    <p>This is the backend API. To test the chatbot, please go to your main SehatAI website (usually <b>http://localhost:5173</b>) and upload an X-Ray in the Patient Chat window.</p>
    '''

@app.route("/health", methods=["GET"])
def health():
    return jsonify({ "status": "ok", "models_loaded": list(MODELS.keys()) })

@app.route("/analyze/<model_type>", methods=["POST"])
def analyze(model_type):
    # Lazy-load the requested model (saves RAM on free tier)
    target = load_model(model_type)
    if not target:
        target = load_model(f"{model_type}_model")

    if not target:
        return jsonify({
            "error": f"Model '{model_type}' not found.",
            "available_models": [f.replace('.pth','') for f in os.listdir(MODEL_DIR) if f.endswith('.pth')]
        }), 404

    data = request.json
    if not data or "image_base64" not in data:
        return jsonify({ "error": "No image_base64 field" }), 400

    try:
        img_data = data["image_base64"]
        if "," in img_data: img_data = img_data.split(",", 1)[1]
        img_bytes = base64.b64decode(img_data)
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        tensor = preprocess(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            outputs = target["net"](tensor)
            probs = torch.softmax(outputs, dim=1)[0]

        predicted_idx = int(torch.argmax(probs).item())
        confidence = float(probs[predicted_idx].item()) * 100
        diagnosis = target["classes"][predicted_idx]
        
        return jsonify({
            "diagnosis": diagnosis,
            "confidence": round(float(confidence), 2),
            "model_type": target["name"],
            "all_probabilities": {target["classes"][i]: round(float(probs[i].item() * 100), 2) for i in range(len(target["classes"]))}
        })
    except Exception as e:
        return jsonify({ "error": str(e) }), 500

# Legacy route for backward compatibility
@app.route("/analyze-image", methods=["POST"])
def analyze_legacy():
    # Default to xray model
    return analyze("xray")


if __name__ == "__main__":
    print(f"\n🚀 SehatAI Multi-Model Server running at http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
