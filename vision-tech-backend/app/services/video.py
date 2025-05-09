# app/services/video.py
import os
import subprocess
import json
from sqlalchemy.orm import Session

from app.models.video import Video


def extract_video_metadata(db: Session, video_id: int) -> None:
    """
    Extract metadata from a video file using ffprobe.
    """
    # Get the video
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return
    
    try:
        # Run ffprobe to get video metadata
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            video.file_path
        ]
        
        # Execute the command
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        metadata = json.loads(result.stdout)
        
        # Extract video information
        video_stream = next((s for s in metadata["streams"] if s["codec_type"] == "video"), None)
        
        if video_stream and "duration" in metadata["format"]:
            # Update video record with metadata
            video.duration = float(metadata["format"]["duration"])
            video.width = int(video_stream.get("width", 0))
            video.height = int(video_stream.get("height", 0))
            video.fps = float(video_stream.get("r_frame_rate", "0/1").split("/")[0])
            video.format = metadata["format"]["format_name"]
            video.processing_status = "ready"
            
            db.commit()
        else:
            video.processing_status = "error"
            db.commit()
    
    except Exception as e:
        # Update video status to error
        video.processing_status = "error"
        db.commit()
        
        # Log the error
        print(f"Error extracting metadata from video {video_id}: {str(e)}")