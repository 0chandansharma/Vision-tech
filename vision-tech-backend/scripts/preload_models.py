# scripts/preload_models.py
import os
import sys
import argparse
import logging
from pathlib import Path
from ultralytics import YOLO

# Add app directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def download_models(force_download=False):
    """
    Download YOLO models for object detection.
    
    Args:
        force_download: Whether to force re-download even if model exists
    """
    # Create models directory if it doesn't exist
    models_dir = os.path.join(settings.LOCAL_STORAGE_PATH, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Models to download
    models = [
        {
            "name": "yolov8n.pt",
            "description": "YOLOv8 Nano model - lightweight and fast"
        },
        {
            "name": "yolov8s.pt",
            "description": "YOLOv8 Small model - balanced performance"
        }
    ]
    
    for model_info in models:
        model_name = model_info["name"]
        model_path = os.path.join(models_dir, model_name)
        
        if os.path.exists(model_path) and not force_download:
            logger.info(f"Model {model_name} already exists at {model_path}")
            continue
        
        logger.info(f"Downloading {model_name} - {model_info['description']}...")
        try:
            # Using ultralytics YOLO to download the model
            model = YOLO(model_name)
            model_path = os.path.join(models_dir, model_name)
            
            # Save a copy to the models directory
            import shutil
            source_path = model.ckpt_path
            shutil.copy(source_path, model_path)
            
            logger.info(f"Successfully downloaded {model_name} to {model_path}")
        except Exception as e:
            logger.error(f"Failed to download {model_name}: {str(e)}")

def create_directories():
    """Create required directories for the application."""
    # Main storage directory
    os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
    
    # Videos directory
    videos_dir = os.path.join(settings.LOCAL_STORAGE_PATH, "videos")
    os.makedirs(videos_dir, exist_ok=True)
    
    # Thumbnails directory
    thumbnails_dir = os.path.join(settings.LOCAL_STORAGE_PATH, "thumbnails")
    os.makedirs(thumbnails_dir, exist_ok=True)
    
    # Models directory
    models_dir = os.path.join(settings.LOCAL_STORAGE_PATH, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Exports directory
    exports_dir = os.path.join(settings.LOCAL_STORAGE_PATH, "exports")
    os.makedirs(exports_dir, exist_ok=True)
    
    logger.info(f"Created required directories in {settings.LOCAL_STORAGE_PATH}")

def main():
    parser = argparse.ArgumentParser(description="Setup Vision Tech Platform")
    parser.add_argument("--force", action="store_true", help="Force re-download of models even if they exist")
    args = parser.parse_args()
    
    logger.info("Setting up Vision Tech Platform...")
    
    # Create required directories
    create_directories()
    
    # Download YOLO models
    download_models(force_download=args.force)
    
    logger.info("Setup completed successfully!")

if __name__ == "__main__":
    main()