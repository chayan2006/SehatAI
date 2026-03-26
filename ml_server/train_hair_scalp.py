"""
SehatAI - Hair & Scalp Disease Classification Model
=====================================================
Transfer Learning using MobileNetV2 (lightweight & fast).
Dataset: Hair and Scalp Disease Dataset (Kaggle - abubakar4u900)

HOW TO RUN:
  > cd ml_server
  > python train_hair_scalp.py

Model saved at: ml_server/model/hair_scalp_model.pth
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
import kagglehub

# ── CONFIG ────────────────────────────────────────────────────────────────────
MODEL_DIR  = os.path.join(os.path.dirname(__file__), "model")
LOCAL_DATA = os.path.join(os.path.dirname(__file__), "data", "hair_scalp")
EPOCHS     = 5
BATCH_SIZE = 32
LR         = 1e-4
VAL_SPLIT  = 0.2
DEVICE     = "cuda" if torch.cuda.is_available() else "cpu"

os.makedirs(MODEL_DIR, exist_ok=True)
print(f"Training on: {DEVICE.upper()}")

# ── DOWNLOAD DATASET ──────────────────────────────────────────────────────────
if os.path.isdir(LOCAL_DATA) and len(os.listdir(LOCAL_DATA)) > 0:
    DATA_DIR = LOCAL_DATA
    print(f"Using local dataset at: {DATA_DIR}")
else:
    print("Downloading Hair & Scalp Disease dataset from Kaggle...")
    kaggle_path = kagglehub.dataset_download("abubakar4u900/hair-and-scalp-disease-dataset")
    print(f"Downloaded to: {kaggle_path}")
    # Find the folder containing image class subdirectories
    DATA_DIR = kaggle_path
    for root, dirs, files in os.walk(kaggle_path):
        if len(dirs) >= 5:  # at least 5 class folders
            DATA_DIR = root
            break
    print(f"Using dataset at: {DATA_DIR}")

# ── DATA TRANSFORMS ───────────────────────────────────────────────────────────
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ── LOAD DATASET ──────────────────────────────────────────────────────────────
full_dataset = datasets.ImageFolder(DATA_DIR, transform=transform)
CLASS_NAMES  = full_dataset.classes
NUM_CLASSES  = len(CLASS_NAMES)

print(f"Classes ({NUM_CLASSES}): {CLASS_NAMES}")
print(f"Total images: {len(full_dataset)}")

# Train/Val split
val_size   = int(len(full_dataset) * VAL_SPLIT)
train_size = len(full_dataset) - val_size
train_ds, val_ds = random_split(full_dataset, [train_size, val_size])
val_ds.dataset.transform = val_transform

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0)
val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

print(f"Train samples: {train_size} | Val samples: {val_size}")

# ── MODEL (MobileNetV2 Transfer Learning) ────────────────────────────────────
model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)

# Freeze base layers
for param in model.parameters():
    param.requires_grad = False

# Replace classifier
model.classifier = nn.Sequential(
    nn.Dropout(0.4),
    nn.Linear(model.last_channel, NUM_CLASSES)
)

model = model.to(DEVICE)

# ── LOSS & OPTIMIZER ──────────────────────────────────────────────────────────
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.classifier.parameters(), lr=LR)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.5)

# ── TRAINING LOOP ─────────────────────────────────────────────────────────────
best_val_acc = 0.0

for epoch in range(1, EPOCHS + 1):
    # --- Train ---
    model.train()
    running_loss, correct, total = 0.0, 0, 0

    for images, labels in train_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total   += labels.size(0)

    train_acc  = correct / total * 100
    train_loss = running_loss / total

    # --- Validate ---
    model.eval()
    val_correct, val_total = 0, 0
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            _, preds = torch.max(model(images), 1)
            val_correct += (preds == labels).sum().item()
            val_total   += labels.size(0)

    val_acc = val_correct / val_total * 100
    print(f"Epoch [{epoch:2d}/{EPOCHS}] | Loss: {train_loss:.4f} | Train: {train_acc:.2f}% | Val: {val_acc:.2f}%")

    # Save best model
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        save_path = os.path.join(MODEL_DIR, "hair_scalp_model.pth")
        torch.save({
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "val_acc": val_acc,
            "class_names": CLASS_NAMES
        }, save_path)
        print(f"   ✅ Saved best model (val_acc={val_acc:.2f}%) → {save_path}")

    scheduler.step()

print(f"\n🎉 Training complete! Best Val Accuracy: {best_val_acc:.2f}%")
print(f"   Model saved at: {os.path.join(MODEL_DIR, 'hair_scalp_model.pth')}")
