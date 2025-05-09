# scripts/download_models.py
import os
import sys
from ultralytics import YOLO

def download_models():
    """
    Download YOLO models for the platform.
    """
    models_dir = os.path.join("storage", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    models = ["yolov8n.pt", "yolov8s.pt", "yolov8m.pt"]
    
    for model_name in models:
        print(f"Downloading {model_name}...")
        model = YOLO(model_name)
        model_path = os.path.join(models_dir, model_name)
        model.export(format="onnx")  # Export to ONNX format for faster inference
        print(f"Model saved to {model_path}")
    
    print("All models downloaded successfully!")

if __name__ == "__main__":
    download_models()