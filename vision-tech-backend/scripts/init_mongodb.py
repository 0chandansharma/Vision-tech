# scripts/init_mongodb.py
import os
import sys
import logging
from pymongo import MongoClient, ASCENDING, DESCENDING

# Add parent directory to path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_mongodb():
    """
    Initialize MongoDB with required collections and indexes.
    
    Sets up collections for:
    - detection_results
    - object_thumbnails
    - timelines
    """
    from app.core.config import settings
    
    # Connect to MongoDB
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}")
    client = MongoClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB]
    
    # Create collections and indexes for detection results
    logger.info("Setting up detection_results collection")
    detection_results = db.detection_results
    detection_results.create_index([("job_id", ASCENDING)])
    detection_results.create_index([("video_id", ASCENDING)])
    detection_results.create_index([("frame_number", ASCENDING)])
    detection_results.create_index([("timestamp", ASCENDING)])
    
    # Create collections and indexes for object thumbnails
    logger.info("Setting up object_thumbnails collection")
    object_thumbnails = db.object_thumbnails
    object_thumbnails.create_index([("job_id", ASCENDING)])
    object_thumbnails.create_index([("video_id", ASCENDING)])
    object_thumbnails.create_index([("class_name", ASCENDING)])
    object_thumbnails.create_index([("confidence", DESCENDING)])
    
    # Create collections and indexes for timelines
    logger.info("Setting up timelines collection")
    timelines = db.timelines
    timelines.create_index([("job_id", ASCENDING)], unique=True)
    timelines.create_index([("video_id", ASCENDING)])
    
    logger.info("MongoDB initialization completed successfully")

def main():
    try:
        logger.info("Starting MongoDB initialization")
        init_mongodb()
    except Exception as e:
        logger.error(f"Error initializing MongoDB: {e}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    main()