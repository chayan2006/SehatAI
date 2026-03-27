"""
train.py  —  SehatAI Injury Detection Model Training
Model: EfficientNet-B0 (pretrained on ImageNet, fine-tuned on wound dataset)
Run: python train.py
"""

import os, json, time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import timm
from tqdm import tqdm

# ── Config ───────────────────────────────────────────────────────────────────
DATA_DIR    = "data"
MODEL_NAME  = "efficientnet_b0"
NUM_EPOCHS  = 25
BATCH_SIZE  = 32
LR          = 1e-4
IMG_SIZE    = 224
SAVE_PATH   = "best_model.pth"
DEVICE      = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ── Transforms ───────────────────────────────────────────────────────────────
train_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE + 32, IMG_SIZE + 32)),
    transforms.RandomCrop(IMG_SIZE),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(20),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2, hue=0.05),
    transforms.RandomGrayscale(p=0.05),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

val_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# ── Dataset ──────────────────────────────────────────────────────────────────
train_ds = datasets.ImageFolder(os.path.join(DATA_DIR, "train"), train_tf)
val_ds   = datasets.ImageFolder(os.path.join(DATA_DIR, "val"),   val_tf)

# num_workers=0 required on Windows to avoid multiprocessing crash
train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0, pin_memory=False)
val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=False)

NUM_CLASSES = len(train_ds.classes)

# Save class names for inference
with open("class_names.json", "w") as f:
    json.dump(train_ds.classes, f, indent=2)

# ── Windows requires __main__ guard for any multiprocessing ──────────────────
if __name__ == '__main__':
    print(f"\n{'='*50}")
    print(f"  SehatAI — Injury Detection Training")
    print(f"  Device : {DEVICE}")
    print(f"  Model  : {MODEL_NAME}")
    print(f"{'='*50}\n")
    print(f"Classes ({NUM_CLASSES}): {train_ds.classes}\n")

    # ── Model ─────────────────────────────────────────────────────────────────
    model = timm.create_model(MODEL_NAME, pretrained=True, num_classes=NUM_CLASSES)
    model = model.to(DEVICE)

    # ── Class weights to handle imbalanced dataset ─────────────────────────────
    class_counts = [len(os.listdir(os.path.join(DATA_DIR, "train", c))) for c in train_ds.classes]
    total        = sum(class_counts)
    weights      = torch.tensor(
        [total / (NUM_CLASSES * c) for c in class_counts], dtype=torch.float
    ).to(DEVICE)
    print(f"Class weights: {[round(w, 3) for w in weights.tolist()]}\n")

    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=NUM_EPOCHS, eta_min=1e-6)

    # ── Training Loop ──────────────────────────────────────────────────────────
    best_val_acc = 0.0
    history      = []

    for epoch in range(1, NUM_EPOCHS + 1):
        t0 = time.time()

        # — Train —
        model.train()
        t_loss = t_correct = 0
        for imgs, lbls in tqdm(train_loader, desc=f"Epoch {epoch:02d}/{NUM_EPOCHS} [Train]", leave=False):
            imgs, lbls = imgs.to(DEVICE), lbls.to(DEVICE)
            optimizer.zero_grad()
            out  = model(imgs)
            loss = criterion(out, lbls)
            loss.backward()
            optimizer.step()
            t_loss    += loss.item() * imgs.size(0)
            t_correct += (out.argmax(1) == lbls).sum().item()
        scheduler.step()

        # — Validate —
        model.eval()
        v_loss = v_correct = 0
        with torch.no_grad():
            for imgs, lbls in tqdm(val_loader, desc=f"Epoch {epoch:02d}/{NUM_EPOCHS} [Val]  ", leave=False):
                imgs, lbls = imgs.to(DEVICE), lbls.to(DEVICE)
                out  = model(imgs)
                loss = criterion(out, lbls)
                v_loss    += loss.item() * imgs.size(0)
                v_correct += (out.argmax(1) == lbls).sum().item()

        train_acc = t_correct / len(train_ds) * 100
        val_acc   = v_correct / len(val_ds)   * 100
        elapsed   = time.time() - t0

        history.append({
            "epoch":     epoch,
            "train_acc": round(train_acc, 2),
            "val_acc":   round(val_acc, 2),
        })

        print(f"Epoch {epoch:02d}/{NUM_EPOCHS}  "
              f"Train: {train_acc:.2f}%  Val: {val_acc:.2f}%  "
              f"({elapsed:.1f}s)", end="")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                "epoch":      epoch,
                "model_name": MODEL_NAME,
                "classes":    train_ds.classes,
                "state_dict": model.state_dict(),
            }, SAVE_PATH)
            print("  ✅ Saved best model")
        else:
            print()

    # ── Save history ───────────────────────────────────────────────────────────
    with open("training_history.json", "w") as f:
        json.dump(history, f, indent=2)

    print(f"\n{'='*50}")
    print(f"  Training Complete!")
    print(f"  Best Val Accuracy : {best_val_acc:.2f}%")
    print(f"  Model saved to    : {SAVE_PATH}")
    print(f"{'='*50}")
