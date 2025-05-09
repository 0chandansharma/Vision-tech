# app/services/detection/yolo.py
import os
import cv2
import torch
import numpy as np
from ultralytics import YOLO

class YOLODetector:
    def __init__(self, model_path=None):
        """
        Initialize the YOLO detector with the specified model.
        
        Args:
            model_path: Path to the YOLO model file (.pt)
        """
        if model_path and os.path.exists(model_path):
            self.model = YOLO(model_path)
        else:
            # Default to YOLOv8n if model not specified or found
            self.model = YOLO("yolov8n.pt")
        
        # Get class names
        self.class_names = self.model.names
    
    def detect(self, frame, conf_threshold=0.25, classes=None):
        """
        Perform object detection on a frame.
        
        Args:
            frame: Input frame (numpy array)
            conf_threshold: Confidence threshold for detection
            classes: List of class indices to detect (None for all classes)
            
        Returns:
            Tuple of (detections, annotated_frame)
            - detections: List of detection objects with class_id, class_name, confidence, and bbox
            - annotated_frame: Frame with detection boxes drawn
        """
        # Run inference
        results = self.model(frame, conf=conf_threshold, classes=classes)
        
        # Process results
        detections = []
        
        for r in results:
            boxes = r.boxes
            
            for box in boxes:
                # Get box coordinates (x1, y1, x2, y2 format)
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                # Convert to x, y, width, height format
                x, y, w, h = x1, y1, x2-x1, y2-y1
                
                # Get class and confidence
                class_id = int(box.cls[0].item())
                class_name = self.class_names[class_id]
                confidence = float(box.conf[0].item())
                
                # Add detection
                detections.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": confidence,
                    "bbox": [float(x), float(y), float(w), float(h)]
                })
        
        # Get annotated frame
        annotated_frame = results[0].plot()
        
        return detections, annotated_frame