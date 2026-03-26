import kagglehub
import os
import shutil

# Download latest version
path = kagglehub.dataset_download("mirichoi0218/insurance")
print("Path to dataset files:", path)

# Copy to local 'dataset' folder
target_dir = os.path.join(os.path.dirname(__file__), "data", "dataset")
os.makedirs(target_dir, exist_ok=True)

for item in os.listdir(path):
    s = os.path.join(path, item)
    d = os.path.join(target_dir, item)
    if os.path.isfile(s):
        shutil.copy2(s, d)
        print(f"Copied {item} to {target_dir}")
