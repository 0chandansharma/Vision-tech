# app/services/detection/motion.py
import cv2
import numpy as np
import time

def detect_motion(frame):
    """
    Detect motion in a frame using background subtraction.
    
    Args:
        frame: The input frame to analyze
        
    Returns:
        Tuple of (motion_detected, motion_areas)
        - motion_detected: Boolean indicating if motion was detected
        - motion_areas: List of bounding boxes for motion areas [x, y, w, h]
    """
    # Convert frame to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (21, 21), 0)
    
    # Global variables for background model
    if not hasattr(detect_motion, "bg_model"):
        detect_motion.bg_model = None
        detect_motion.frame_count = 0
    
    # Initialize background model
    if detect_motion.bg_model is None:
        detect_motion.bg_model = gray.copy().astype("float")
        return False, []
    
    # Update frame count
    detect_motion.frame_count += 1
    
    # Calculate difference between current frame and background
    cv2.accumulateWeighted(gray, detect_motion.bg_model, 0.1)
    frameDelta = cv2.absdiff(gray, cv2.convertScaleAbs(detect_motion.bg_model))
    
    # Threshold the delta image
    thresh = cv2.threshold(frameDelta, 25, 255, cv2.THRESH_BINARY)[1]
    thresh = cv2.dilate(thresh, None, iterations=2)
    
    # Find contours
    contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    motion_detected = False
    motion_areas = []
    
    # Check for motion
    for contour in contours:
        # Filter small contours
        if cv2.contourArea(contour) < 500:
            continue
            
        motion_detected = True
        x, y, w, h = cv2.boundingRect(contour)
        motion_areas.append([float(x), float(y), float(w), float(h)])
    
    return motion_detected, motion_areas