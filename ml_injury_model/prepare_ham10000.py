import pandas as pd
import os
import shutil
import glob

# Description: This script automatically organizes the Kaggle HAM10000 dataset into 
# the format our custom SehatAI ML model expects!

# Ensure pandas is installed (pip install pandas)
try:
    import pandas as pd
except ImportError:
    print("Please run: pip install pandas")
    print("Then restart this script.")
    exit()

# 1. Look for the dataset folder you unzipped
base_dir = "HAM10000" 
metadata_path = os.path.join(base_dir, "HAM10000_metadata.csv")

if not os.path.exists(metadata_path):
    print(f"❌ Could not find {metadata_path}.")
    print("Please make sure you downloaded the Kaggle dataset, unzipped it, and named the unzipped folder 'HAM10000' right next to this script.")
    exit()

# 2. Map the scary medical abbreviations to human-readable names
class_mapping = {
    'nv': 'Melanocytic nevi',
    'mel': 'Melanoma',
    'bkl': 'Benign keratosis',
    'bcc': 'Basal cell carcinoma',
    'akiec': 'Actinic keratoses',
    'vasc': 'Vascular lesions',
    'df': 'Dermatofibroma'
}

raw_dataset_dir = "dataset/raw"

# Read the CSV
df = pd.read_csv(metadata_path)

# Create folders for each class
for class_id, class_name in class_mapping.items():
    folder_path = os.path.join(raw_dataset_dir, class_name)
    os.makedirs(folder_path, exist_ok=True)

print("🔍 Finding all images in the HAM10000 folder...")
all_images = glob.glob(f"{base_dir}/**/*.jpg", recursive=True)

# Create a dictionary linking image_id (without .jpg) to its real file path
image_dict = {os.path.basename(p).split('.')[0]: p for p in all_images}

print(f"✅ Found {len(all_images)} images. Organizing them into class folders...")

moved_count = 0
for index, row in df.iterrows():
    image_id = row['image_id']
    cancer_type = row['dx'] 
    
    if image_id in image_dict and cancer_type in class_mapping:
        src_path = image_dict[image_id]
        class_name = class_mapping[cancer_type]
        dst_path = os.path.join(raw_dataset_dir, class_name, f"{image_id}.jpg")
        
        # Copy the image to our dataset structure
        if not os.path.exists(dst_path):
            shutil.copy(src_path, dst_path)
            moved_count += 1

print(f"\n🎉 SUCCESS! Organized {moved_count} skin cancer images into {raw_dataset_dir}/.")
print("👉 You can now delete the original 'HAM10000' download folder to save space if you want.")
print("👉 Next step: Run 'python setup_folders.py' to split these into Train/Val/Test.")
