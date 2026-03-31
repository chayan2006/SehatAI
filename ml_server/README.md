# SehatAI ML Server — Unified Training & API

This is the **single source of truth** for all SehatAI machine learning models.
It hosts the Flask API and all training scripts in one place.

---

## 📁 Directory Structure

```
ml_server/
├── model/                      # Trained model weights (.pth files)
│   ├── hair_model.pth          # Hair Disease (DenseNet121, 99.8% acc)
│   ├── health_model.pth        # Skin Cancer (DenseNet121)
│   ├── xray_model.pth          # Chest X-Ray (DenseNet121)
│   └── injury_model.pth        # Wound Classification (EfficientNet-B0)
│
├── server.py                   # 🚀 MAIN API — serves ALL models on :5001
├── train.py                    # 🧠 Train Hair/Skin/XRay models (DenseNet121)
├── train_injury.py             # 🩹 Train Injury model (EfficientNet-B0)
├── setup_folders_injury.py     # Splits injury dataset into train/val/test
├── prepare_ham10000.py         # Prepares HAM10000 skin dataset
├── requirements.txt            # All dependencies
└── venv/                       # Python virtual environment
```

---

## 🚀 Start the API Server

```bash
cd ml_server
venv\Scripts\activate          # Activate environment (Windows)
python server.py               # Starts on http://localhost:5001
```

The server **automatically loads all `.pth` files** in `model/`. You'll see:
```
✅ Loaded Model: hair_model (10 classes)
✅ Loaded Model: health_model (7 classes)
✅ Loaded Model: injury_model (12 classes)
🚀 SehatAI Multi-Model Server running at http://localhost:5001
```

---

## 🧠 Train Models

### Hair / Skin / X-Ray (DenseNet121)
```bash
# Edit train.py to set KAGGLE_DATASET and NUM_CLASSES, then:
python train.py
```

### Injury / Wound (EfficientNet-B0)
```bash
# 1. Download dataset from: https://www.kaggle.com/datasets/ibrahimfateen/wound-classification
# 2. Extract into ml_server/kaggle_raw/
python setup_folders_injury.py   # Split into train/val/test
python train_injury.py           # Train (saves to model/injury_model.pth)
```

---

## 🔌 API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/health` | GET | Lists all loaded models |
| `/analyze/<model_type>` | POST | Run inference on a specific model |
| `/analyze-image` | POST | Legacy route (defaults to hair_model) |

### Example Request
```json
POST /analyze/injury_model
{ "image_base64": "data:image/jpeg;base64,..." }
```

### Example Response
```json
{
  "diagnosis": "Abrasion",
  "confidence": 87.23,
  "model_type": "INJURY",
  "all_probabilities": { "Abrasion": 87.23, "Bruise": 8.1, ... }
}
```

---

## 📦 Install Dependencies

```bash
cd ml_server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
