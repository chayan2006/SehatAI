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

# ── CONFIG ────────────────────────────────────────────────────────────────────
MODEL_PATH  = os.path.join(os.path.dirname(__file__), "model", "xray_model.pth")
DEVICE      = "cuda" if torch.cuda.is_available() else "cpu"
CLASS_NAMES = ["NORMAL", "PNEUMONIA"]

# ── FLASK APP ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)   # Allow requests from React app (localhost:5173)

# ── LOAD MODEL ────────────────────────────────────────────────────────────────
model = None

def load_model():
    global model, CLASS_NAMES
    if not os.path.exists(MODEL_PATH):
        print("⚠️  Model file not found at:", MODEL_PATH)
        print("   Please run train.py first.")
        return False

    # Rebuild architecture
    net = models.densenet121(weights=None)
    net.classifier = nn.Sequential(
        nn.Linear(net.classifier.in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(256, len(CLASS_NAMES))
    )

    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
    net.load_state_dict(checkpoint["model_state_dict"])
    CLASS_NAMES = checkpoint.get("class_names", CLASS_NAMES)

    net.eval()
    net.to(DEVICE)
    model = net
    print(f"✅ Model loaded from {MODEL_PATH}")
    print(f"   Classes: {CLASS_NAMES}")
    return True

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
    return jsonify({ "status": "ok", "model_loaded": model is not None })

@app.route("/analyze-xray", methods=["POST"])
def analyze_xray():
    if model is None:
        return jsonify({
            "error": "Model not loaded. Please run train.py first.",
            "diagnosis": "Model Unavailable",
            "confidence": 0
        }), 503

    data = request.json
    if not data or "image_base64" not in data:
        return jsonify({ "error": "No image_base64 field in request body." }), 400

    try:
        # Decode the base64 image from React
        img_data = data["image_base64"]
        # Strip header if present: "data:image/jpeg;base64,xxxx"
        if "," in img_data:
            img_data = img_data.split(",", 1)[1]

        img_bytes = base64.b64decode(img_data)
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # Preprocess and classify
        tensor = preprocess(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            outputs = model(tensor)
            probs = torch.softmax(outputs, dim=1)[0]

        # Build result
        predicted_idx = int(torch.argmax(probs).item())
        confidence    = float(probs[predicted_idx].item()) * 100
        diagnosis     = CLASS_NAMES[predicted_idx]

        all_probs = {CLASS_NAMES[i]: round(float(probs[i].item()) * 100, 2) for i in range(len(CLASS_NAMES))}

        return jsonify({
            "diagnosis": diagnosis,
            "confidence": round(confidence, 2),
            "all_probabilities": all_probs,
            "model": "DenseNet121 (SehatAI Custom)"
        })

    except Exception as e:
        return jsonify({ "error": str(e) }), 500


if __name__ == "__main__":
    model_ok = load_model()
    if not model_ok:
        print("\n🔴 Starting server in DEMO mode (no model loaded).")
        print("   Train the model first using: python train.py")

    print("\n🚀 SehatAI ML Server running at http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
