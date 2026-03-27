"""
SehatAI - Custom X-Ray Classification Model
============================================
Transfer Learning using DenseNet121.
Dataset: Kaggle Chest X-Ray Images (Pneumonia)
  -> Download from: https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
  -> Unzip into ml_server/data/ so the structure is:
       ml_server/data/chest_xray/train/NORMAL/
       ml_server/data/chest_xray/train/PNEUMONIA/
       ml_server/data/chest_xray/val/...
       ml_server/data/chest_xray/test/...

STEP 1: Setup Python environment
  > cd ml_server
  > python -m venv venv
  > venv\\Scripts\\activate         (Windows)  OR  source venv/bin/activate  (Mac/Linux)
  > pip install -r requirements.txt

STEP 2: Download the dataset from Kaggle (link above), unzip into ml_server/data/

STEP 3: Run this training script
  > python train.py
  This will save the trained model as: ml_server/model/xray_model.pth
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import kagglehub

# ── CONFIG ────────────────────────────────────────────────────────────────────
LOCAL_DATA      = os.path.join(os.path.dirname(__file__), "data", "xray_disease")
MODEL_DIR       = os.path.join(os.path.dirname(__file__), "model")
MODEL_SAVE_NAME = "xray_model.pth"
EPOCHS      = 5
BATCH_SIZE  = 32
LR          = 1e-4
DEVICE      = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Training on: {DEVICE.upper()}")
os.makedirs(MODEL_DIR, exist_ok=True)

# ── AUTO-DOWNLOAD DATASET via kagglehub ─────────────────────────────────────────
if os.path.isdir(LOCAL_DATA):
    print(f"Dataset already exists at: {LOCAL_DATA}")
    DATA_DIR = LOCAL_DATA
else:
    print("Downloading Chest X-Ray (Pneumonia) dataset from Kaggle...")
    print("(This may take a few minutes)")
    kaggle_path = kagglehub.dataset_download("paultimothymooney/chest-xray-pneumonia")
    print(f"Dataset downloaded to: {kaggle_path}")
    for root, dirs, _ in os.walk(kaggle_path):
        if "train" in dirs:
            DATA_DIR = root
            break
    else:
        DATA_DIR = kaggle_path
    print(f"Using dataset at: {DATA_DIR}")

# ── DATA TRANSFORMS ───────────────────────────────────────────────────────────
train_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomVerticalFlip(p=0.1),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.3, contrast=0.3),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

val_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ── DATASETS & LOADERS ────────────────────────────────────────────────────────
train_dataset = datasets.ImageFolder(os.path.join(DATA_DIR, "train"), train_transforms)

train_loader  = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0)

# The skin cancer dataset might not have a "val" folder. If it has "test", we use that.
val_path = os.path.join(DATA_DIR, "val")
if not os.path.exists(val_path):
    val_path = os.path.join(DATA_DIR, "test")

val_dataset   = datasets.ImageFolder(val_path, val_transforms)
val_loader    = DataLoader(val_dataset,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

CLASS_NAMES = train_dataset.classes
NUM_CLASSES = len(CLASS_NAMES)

print(f"Training samples : {len(train_dataset)}")
print(f"Validation samples : {len(val_dataset)}")
print(f"Classes ({NUM_CLASSES}): {CLASS_NAMES}")

# ── MODEL (DenseNet121 Transfer Learning) ─────────────────────────────────────
model = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)

# 1:30-HOUR FULL POWER CPU: Freeze visual features for speed, but use ALL 9,600 images
for param in model.parameters():
    param.requires_grad = False

# Use 256 middle nodes for faster CPU math
model.classifier = nn.Sequential(
    nn.Linear(model.classifier.in_features, 256),
    nn.ReLU(),
    nn.Dropout(0.4),
    nn.Linear(256, NUM_CLASSES)
)

model = model.to(DEVICE)

# ── LOSS & OPTIMIZER ──────────────────────────────────────────────────────────
# Dynamically Calculate Class Weights to prevent the Medical AI from ignoring rare diseases
class_counts = [0] * NUM_CLASSES
for _, label in train_dataset.samples:
    class_counts[label] += 1

print(f"Dataset Imbalance Check: {dict(zip(CLASS_NAMES, class_counts))}")
class_weights = [len(train_dataset) / count for count in class_counts]
weights_tensor = torch.FloatTensor(class_weights).to(DEVICE)

criterion = nn.CrossEntropyLoss(weight=weights_tensor)
optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=LR, weight_decay=1e-4)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=2)

# ── TRAINING LOOP ─────────────────────────────────────────────────────────────
best_val_acc = 0.0

for epoch in range(1, EPOCHS + 1):
    # --- Train ---
    model.train()
    running_loss, correct, total = 0.0, 0, 0

    for i, (images, labels) in enumerate(train_loader):
        # 🔥 1:30-HOUR FULL DATASET CPU MODE (Removed batch limits)
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += torch.sum(preds == labels).item()
        total += labels.size(0)

    train_loss = running_loss / total
    train_acc  = correct / total * 100

    # --- Validate ---
    model.eval()
    val_correct, val_total = 0, 0
    with torch.no_grad():
        for j, (images, labels) in enumerate(val_loader):
            # 🔥 USING FULL VALIDATION SET
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            val_correct += torch.sum(preds == labels).item()
            val_total   += labels.size(0)

    val_acc = val_correct / val_total * 100

    print(f"Epoch [{epoch:2d}/{EPOCHS}] | Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% | Val Acc: {val_acc:.2f}%")

    # Save best model
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        save_path = os.path.join(MODEL_DIR, "hair_model.pth")
        torch.save({
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "val_acc": val_acc,
            "class_names": CLASS_NAMES
        }, save_path)
        print(f"   ✅ Saved best model (val_acc={val_acc:.2f}%) → {save_path}")

    # Step the plateau scheduler with validation accuracy
    scheduler.step(val_acc)

print(f"\n🎉 Training complete! Best Validation Accuracy: {best_val_acc:.2f}%")
print(f"   Model saved at: {os.path.join(MODEL_DIR, 'hair_model.pth')}")
