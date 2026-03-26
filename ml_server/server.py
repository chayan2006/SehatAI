"""
SehatAI - ML Flask API Server
==============================
Endpoints:
  POST /analyze-xray       → Chest X-Ray Pneumonia detection (DenseNet121)
  POST /analyze-hair       → Hair & Scalp Disease classification (MobileNetV2)
  GET  /health             → Health check

HOW TO RUN:
  > cd ml_server
  > python server.py

Server starts at: http://localhost:5001
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

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ── FLASK APP ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── SHARED PREPROCESSING ──────────────────────────────────────────────────────
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def decode_image(image_base64):
    """Decode a base64 image string into a PIL Image."""
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]
    img_bytes = base64.b64decode(image_base64)
    return Image.open(io.BytesIO(img_bytes)).convert("RGB")

# ── XRAY MODEL (DenseNet121) ──────────────────────────────────────────────────
XRAY_MODEL_PATH  = os.path.join(os.path.dirname(__file__), "model", "xray_model.pth")
XRAY_CLASS_NAMES = ["NORMAL", "PNEUMONIA"]
xray_model       = None

def load_xray_model():
    global xray_model, XRAY_CLASS_NAMES
    if not os.path.exists(XRAY_MODEL_PATH):
        print("⚠️  X-Ray model not found. Run train.py first.")
        return False
    net = models.densenet121(weights=None)
    net.classifier = nn.Sequential(
        nn.Linear(net.classifier.in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(256, len(XRAY_CLASS_NAMES))
    )
    checkpoint = torch.load(XRAY_MODEL_PATH, map_location=DEVICE)
    net.load_state_dict(checkpoint["model_state_dict"])
    XRAY_CLASS_NAMES = checkpoint.get("class_names", XRAY_CLASS_NAMES)
    net.eval().to(DEVICE)
    xray_model = net
    print(f"✅ X-Ray model loaded | Classes: {XRAY_CLASS_NAMES}")
    return True

# ── HAIR SCALP MODEL (MobileNetV2) ───────────────────────────────────────────
HAIR_MODEL_PATH  = os.path.join(os.path.dirname(__file__), "model", "hair_scalp_model.pth")
HAIR_CLASS_NAMES = []
hair_model       = None

def load_hair_model():
    global hair_model, HAIR_CLASS_NAMES
    if not os.path.exists(HAIR_MODEL_PATH):
        print("⚠️  Hair & Scalp model not found. Run train_hair_scalp.py first.")
        return False
    checkpoint      = torch.load(HAIR_MODEL_PATH, map_location=DEVICE)
    HAIR_CLASS_NAMES = checkpoint.get("class_names", [])
    num_classes     = len(HAIR_CLASS_NAMES)

    net = models.mobilenet_v2(weights=None)
    net.classifier = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(net.last_channel, num_classes)
    )
    net.load_state_dict(checkpoint["model_state_dict"])
    net.eval().to(DEVICE)
    hair_model = net
    print(f"✅ Hair & Scalp model loaded | Classes: {HAIR_CLASS_NAMES}")
    return True

# ── ROUTES ────────────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def index():
    return '''
    <h1>✅ SehatAI Machine Learning Server is Running!</h1>
    <p>Available endpoints:</p>
    <ul>
      <li><b>POST /analyze-xray</b> — Chest X-Ray Pneumonia Detection</li>
      <li><b>POST /analyze-hair</b> — Hair &amp; Scalp Disease Classification</li>
      <li><b>GET  /health</b> — Health check</li>
    </ul>
    '''

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "xray_model_loaded": xray_model is not None,
        "hair_model_loaded": hair_model is not None
    })

@app.route("/analyze-xray", methods=["POST"])
def analyze_xray():
    if xray_model is None:
        return jsonify({"error": "X-Ray model not loaded.", "diagnosis": "Unavailable", "confidence": 0}), 503

    data = request.json
    if not data or "image_base64" not in data:
        return jsonify({"error": "No image_base64 field in request body."}), 400

    try:
        image  = decode_image(data["image_base64"])
        tensor = preprocess(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            probs = torch.softmax(xray_model(tensor), dim=1)[0]

        idx        = int(torch.argmax(probs).item())
        confidence = float(probs[idx].item()) * 100
        all_probs  = {XRAY_CLASS_NAMES[i]: round(float(probs[i].item()) * 100, 2) for i in range(len(XRAY_CLASS_NAMES))}

        return jsonify({
            "diagnosis": XRAY_CLASS_NAMES[idx],
            "confidence": round(confidence, 2),
            "all_probabilities": all_probs,
            "model": "DenseNet121 (SehatAI Custom)"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/analyze-hair", methods=["POST"])
def analyze_hair():
    if hair_model is None:
        return jsonify({"error": "Hair & Scalp model not loaded.", "diagnosis": "Unavailable", "confidence": 0}), 503

    data = request.json
    if not data or "image_base64" not in data:
        return jsonify({"error": "No image_base64 field in request body."}), 400

    try:
        image  = decode_image(data["image_base64"])
        tensor = preprocess(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            probs = torch.softmax(hair_model(tensor), dim=1)[0]

        idx        = int(torch.argmax(probs).item())
        confidence = float(probs[idx].item()) * 100
        all_probs  = {HAIR_CLASS_NAMES[i]: round(float(probs[i].item()) * 100, 2) for i in range(len(HAIR_CLASS_NAMES))}

        return jsonify({
            "diagnosis": HAIR_CLASS_NAMES[idx],
            "confidence": round(confidence, 2),
            "all_probabilities": all_probs,
            "model": "MobileNetV2 (SehatAI Custom)"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    load_xray_model()
    load_hair_model()
    print("\n🚀 SehatAI ML Server running at http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
