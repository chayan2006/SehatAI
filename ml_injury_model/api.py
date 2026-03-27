"""
api.py  —  SehatAI Injury Detection FastAPI Server
Run: uvicorn api:app --host 0.0.0.0 --port 8000 --reload
"""

import io, json
import torch
import timm
from torchvision import transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SehatAI Injury Detection API",
    description="Upload an injury image → get AI diagnosis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Model on startup ─────────────────────────────────────────────────────
MODEL_PATH = "best_model.pth"
checkpoint = torch.load(MODEL_PATH, map_location="cpu")

CLASS_NAMES = checkpoint["classes"]
NUM_CLASSES = len(CLASS_NAMES)
MODEL_NAME  = checkpoint.get("model_name", "efficientnet_b0")

model = timm.create_model(MODEL_NAME, pretrained=False, num_classes=NUM_CLASSES)
model.load_state_dict(checkpoint["state_dict"])
model.eval()

TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# Severity map — customize based on your class names
SEVERITY_MAP = {
    "burns":           "HIGH",
    "cut":             "MEDIUM",
    "cuts":            "MEDIUM",
    "laceration":      "MEDIUM",
    "lacerations":     "MEDIUM",
    "stab_wound":      "HIGH",
    "stab_wounds":     "HIGH",
    "fracture":        "HIGH",
    "bruise":          "LOW",
    "bruises":         "LOW",
    "abrasion":        "LOW",
    "abrasions":       "LOW",
    "ingrown_nail":    "LOW",
    "ingrown_nails":   "LOW",
    "diabetic_wound":  "HIGH",
    "pressure_wound":  "HIGH",
    "surgical_wound":  "MEDIUM",
    "venous_wound":    "MEDIUM",
    "normal":          "NONE",
    "normal_skin":     "NONE",
}

def get_severity(class_name: str) -> str:
    key = class_name.lower().replace(' ', '_')
    return SEVERITY_MAP.get(key, "MEDIUM")

def get_first_aid(class_name: str) -> str:
    tips = {
        "burn":           "Cool with running water for 10-20 min. Do NOT use ice. Cover loosely.",
        "cut":            "Apply pressure with a clean cloth. Elevate if possible. Clean gently.",
        "laceration":     "Apply direct pressure. Seek medical attention if deep or gaping.",
        "stab":           "Do NOT remove the object. Apply pressure around it. Call emergency services.",
        "bruise":         "Apply ice pack for 20 min. Elevate the area. Rest.",
        "abrasion":       "Clean with water, apply antiseptic, cover with sterile bandage.",
        "ingrown_nail":   "Soak in warm water, avoid tight footwear. See a podiatrist if infected.",
        "pressure_wound": "Relieve pressure immediately. Keep area clean and moist. See a doctor.",
        "diabetic_wound": "Do NOT self-treat. Seek medical care immediately.",
        "actinic_keratose": "This is a precancerous skin lesion. Please schedule an appointment with a dermatologist.",
        "basal_cell_carcinoma": "This may be skin cancer. Please seek professional medical evaluation immediately.",
        "benign_keratosi": "This is likely a non-cancerous skin growth, but please consult a doctor to confirm.",
        "dermatofibroma": "This is likely a benign nodule, but we recommend a dermatologist evaluate it.",
        "melanocytic_nevi": "This appears to be a mole. Monitor it for changes in size, shape, or color, and see a doctor if it changes.",
        "melanoma": "URGENT: This requires immediate evaluation by a dermatologist or oncologist. Do not delay.",
        "vascular_lesion": "This is related to blood vessels in the skin. Consult a dermatologist for proper diagnosis.",
        "normal":         "No injury detected. Stay healthy! 💚",
    }
    
    key = class_name.lower().replace(' ', '_')
    # Strip plural 's' at the end to match our keys above
    if key.endswith('s') and key != 'normal_skin':
        key = key[:-1]
        
    for k, tip in tips.items():
        if k in key or key in k:
            return tip
            
    return "Seek professional medical attention for this injury."

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME, "classes": CLASS_NAMES}

@app.post("/analyze-injury")
async def analyze_injury(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        img_bytes = await file.read()
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image file.")

    tensor = TRANSFORM(image).unsqueeze(0)  # [1, 3, 224, 224]

    with torch.no_grad():
        logits = model(tensor)
        probs  = torch.softmax(logits, dim=1)[0]

    top_idx  = probs.argmax().item()
    top_name = CLASS_NAMES[top_idx]
    top_conf = round(probs[top_idx].item() * 100, 2)

    all_preds = sorted(
        [{"injury": CLASS_NAMES[i], "confidence": round(probs[i].item() * 100, 2)}
         for i in range(NUM_CLASSES)],
        key=lambda x: x["confidence"], reverse=True
    )

    return {
        "top_prediction":  top_name,
        "confidence":      top_conf,
        "severity":        get_severity(top_name),
        "first_aid_tip":   get_first_aid(top_name),
        "all_predictions": all_preds,
        "disclaimer":      "AI-assisted analysis only. Not a substitute for professional medical advice.",
    }
