import kagglehub
import os
import shutil

# Download latest version
path = kagglehub.dataset_download("abubakar4u900/hair-and-scalp-disease-dataset")
print("Path to dataset files:", path)

# Copy to local 'data/hair_scalp' folder
target_dir = os.path.join(os.path.dirname(__file__), "data", "hair_scalp")
os.makedirs(target_dir, exist_ok=True)

for item in os.listdir(path):
    s = os.path.join(path, item)
    d = os.path.join(target_dir, item)
    if os.path.isdir(s):
        if os.path.exists(d):
            shutil.rmtree(d)
        shutil.copytree(s, d)
        print(f"Copied folder '{item}' -> {d}")
    elif os.path.isfile(s):
        shutil.copy2(s, d)
        print(f"Copied file '{item}' -> {target_dir}")

print("\nDataset ready at:", target_dir)
