"""
api.py — SehatAI 3D Lung Tumor Segmentation API
Run: python -m uvicorn api:app --host 0.0.0.0 --port 8001
"""

import os
import io
import torch
import nibabel as nib
import numpy as np
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from monai.networks.nets import UNet
from monai.transforms import (
    Compose, LoadImaged, EnsureChannelFirstd, Orientationd,
    Spacingd, ScaleIntensityRanged, CropForegroundd, Resized, ToTensord
)

app = FastAPI(title="SehatAI Lung Segmentation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "best_lung_unet.pth")

# Load Model
model = UNet(
    spatial_dims=3,
    in_channels=1,
    out_channels=2,
    channels=(16, 32, 64, 128, 256),
    strides=(2, 2, 2, 2),
    num_res_units=2,
).to(DEVICE)

if os.path.exists(MODEL_PATH):
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False))
    print(f"✅ Loaded Lung UNet model from {MODEL_PATH}")
else:
    print(f"⚠️ Model file not found at {MODEL_PATH}, running without weights")

model.eval()

# Inference transforms
inference_transforms = Compose([
    LoadImaged(keys=["image"]),
    EnsureChannelFirstd(keys=["image"]),
    Orientationd(keys=["image"], axcodes="RAS"),
    Spacingd(keys=["image"], pixdim=(1.5, 1.5, 2.0), mode="bilinear"),
    ScaleIntensityRanged(keys=["image"], a_min=-1000, a_max=400, b_min=0.0, b_max=1.0, clip=True),
    CropForegroundd(keys=["image"], source_key="image"),
    Resized(keys=["image"], spatial_size=(96, 96, 96)),
    ToTensord(keys=["image"]),
])


@app.get("/health")
def health():
    return {"status": "ok", "device": str(DEVICE), "model": "3D_UNet_Lung"}


@app.post("/analyze-lung")
async def analyze_lung(file: UploadFile = File(...)):
    if not (file.filename.endswith('.nii') or file.filename.endswith('.nii.gz')):
        raise HTTPException(status_code=400, detail="Only .nii or .nii.gz 3D CT Scans are supported.")

    try:
        data_bytes = await file.read()
        original_ext = ".nii.gz" if file.filename.endswith(".nii.gz") else ".nii"

        fd, temp_path = tempfile.mkstemp(suffix=original_ext)
        with os.fdopen(fd, 'wb') as f:
            f.write(data_bytes)

        input_data = {"image": temp_path}
        transformed_data = inference_transforms(input_data)

        input_tensor = transformed_data["image"].unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            outputs = model(input_tensor)
            mask_tensor = torch.argmax(outputs, dim=1).squeeze().cpu().numpy()

        tumor_volume_voxels = int(np.sum(mask_tensor == 1))

        os.remove(temp_path)

        if tumor_volume_voxels > 0:
            severity = "HIGH" if tumor_volume_voxels > 1000 else "MEDIUM"
            message = "Tumor voxels detected."
        else:
            severity = "NONE"
            message = "No clear anomalies detected by the AI. Clear scan."

        return {
            "prediction": "Lung Scan Analyzed",
            "tumor_voxel_count": tumor_volume_voxels,
            "severity": severity,
            "message": message,
            "filename": file.filename
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
