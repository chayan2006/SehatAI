# SehatAI Injury Detection ML Model

## Step-by-Step Instructions

### Step 1 — Download Kaggle Dataset
👉 **Dataset Link:** https://www.kaggle.com/datasets/ibrahimfateen/wound-classification

Download the ZIP and extract it into:
```
ml_injury_model/kaggle_raw/
```

Your folder should look like:
```
kaggle_raw/
  ├── Abrasion/
  ├── Bruise/
  ├── Burn/
  ├── Cut/
  ...
```

---

### Step 2 — Install Dependencies
```bash
cd ml_injury_model
pip install -r requirements.txt
```

---

### Step 3 — Organize Dataset
```bash
python setup_folders.py
```
This auto-splits images into train/val/test (75/15/10).

---

### Step 4 — Train the Model
```bash
python train.py
```
- Best model saved as `best_model.pth`
- Takes ~10 min on GPU, ~1 hour on CPU

---

### Step 5 — Start the API
```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```
Test at: http://localhost:8000/docs

---

### Step 6 — Test with an Image
```bash
curl -X POST http://localhost:8000/analyze-injury \
  -F "file=@your_image.jpg"
```
