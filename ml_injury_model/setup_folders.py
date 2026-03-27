"""
setup_folders.py
Run this FIRST after downloading the Kaggle dataset.
It organizes raw Kaggle images into train/val/test splits automatically.
"""

import os
import shutil
import random
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────────────
# Change this to wherever you extracted the Kaggle dataset zip
KAGGLE_DATASET_PATH = r"C:\Users\Amit Singh Panwar\Agentic Ai\SehatAI\ml_injury_model\dataset\raw"

OUTPUT_DIR   = r"C:\Users\Amit Singh Panwar\Agentic Ai\SehatAI\ml_injury_model\data"
TRAIN_RATIO  = 0.75
VAL_RATIO    = 0.15
TEST_RATIO   = 0.10
RANDOM_SEED  = 42

IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}

random.seed(RANDOM_SEED)

# ── Auto-detect class folders from Kaggle dump ──────────────────────────────────
def find_class_folders(root):
    """Walk tree and find all folders that contain images."""
    class_dirs = {}
    for dirpath, _, files in os.walk(root):
        imgs = [f for f in files if Path(f).suffix.lower() in IMAGE_EXTS]
        if imgs:
            class_name = Path(dirpath).name.lower().replace(' ', '_')
            class_dirs[class_name] = (dirpath, imgs)
    return class_dirs

# ── Create split directories ────────────────────────────────────────────────────
def create_split(class_name, split, files, src_dir):
    dest = os.path.join(OUTPUT_DIR, split, class_name)
    os.makedirs(dest, exist_ok=True)
    for f in files:
        shutil.copy2(os.path.join(src_dir, f), os.path.join(dest, f))

# ── Main ────────────────────────────────────────────────────────────────────────
print(f"\n🔍 Scanning: {KAGGLE_DATASET_PATH}")
class_dirs = find_class_folders(KAGGLE_DATASET_PATH)

if not class_dirs:
    print("❌ No image folders found! Check KAGGLE_DATASET_PATH.")
    exit()

print(f"✅ Found {len(class_dirs)} classes:")
for name, (path, imgs) in class_dirs.items():
    print(f"   {name:30s} → {len(imgs)} images")

print(f"\n📂 Splitting into: {OUTPUT_DIR}")

for class_name, (src_dir, all_files) in class_dirs.items():
    random.shuffle(all_files)
    n = len(all_files)
    n_train = int(n * TRAIN_RATIO)
    n_val   = int(n * VAL_RATIO)

    train_files = all_files[:n_train]
    val_files   = all_files[n_train:n_train + n_val]
    test_files  = all_files[n_train + n_val:]

    create_split(class_name, 'train', train_files, src_dir)
    create_split(class_name, 'val',   val_files,   src_dir)
    create_split(class_name, 'test',  test_files,  src_dir)

    print(f"  ✔ {class_name}: {len(train_files)} train | {len(val_files)} val | {len(test_files)} test")

print("\n✅ Done! Your data folder is ready for training.")
print(f"   → {OUTPUT_DIR}")
