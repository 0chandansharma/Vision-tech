# Vision-tech Platform

A computer vision platform for object detection using YOLO and motion detection algorithms.

## Features

- **Video Management**: Upload, organize, and browse videos by project
- **Object Detection**: Detect objects in videos using YOLO models
- **Motion Detection**: Identify motion in videos using background subtraction
- **Result Visualization**: View detection results with timeline and object thumbnails
- **Export Capabilities**: Export detection results in JSON and CSV formats
- **User Management**: Role-based access control for different user types
- **Admin Dashboard**: Monitor system status and detection jobs

## Technologies

- **Backend**: Python with FastAPI, SQLAlchemy, PyMongo
- **Frontend**: React with TypeScript, Redux, Material-UI
- **AI/ML**: YOLO (via Ultralytics), OpenCV for motion detection
- **Databases**: PostgreSQL for relational data, MongoDB for detection results

## Prerequisites

- **PostgreSQL**: Install and start PostgreSQL server
- **MongoDB**: Install and start MongoDB server
- **Python 3.8+**: For the backend
- **Node.js 14+**: For the frontend

## Getting Started

### Step 1: Database Setup

First, make sure PostgreSQL and MongoDB are running:

```bash
# For PostgreSQL (macOS)
brew services start postgresql

# For MongoDB (macOS)
brew services start mongodb-community
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd vision-tech-backend

# Install Python dependencies
pip install -r requirements.txt

# Initialize PostgreSQL database
python scripts/init_db.py

# Initialize MongoDB collections
python scripts/init_mongodb.py

# Download and preload YOLO models (may take some time)
python scripts/preload_models.py

# Create storage directories
mkdir -p storage/videos storage/thumbnails storage/models storage/exports

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

### Step 3: Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend directory
cd vision-tech-frontend

# Install Node.js dependencies
npm install

# Start the frontend development server
npm start
```

## Using the Platform

1. **Access the application**:
   - Frontend: Open your browser and go to `http://localhost:3000`
   - API Documentation: Swagger UI is available at `http://localhost:8000/docs`

2. **Login with default admin**:
   - Username: `admin`
   - Password: `adminpassword`

3. **Basic workflow**:
   - Create a new project
   - Upload videos to the project
   - Configure and run detection using YOLO or motion detection
   - View detection results with timeline navigation
   - Filter and browse detected objects
   - Export results in JSON or CSV format

## Troubleshooting

### Database Connection Issues

If you have problems connecting to PostgreSQL:

```bash
# Check PostgreSQL configuration
# Create the database manually if needed
psql postgres
CREATE DATABASE visiontech;
```

For MongoDB connection issues:

```bash
# Check MongoDB status
mongosh
use visiontech
```

### Storage Issues

Ensure the storage directories have proper permissions:

```bash
# Give full permissions to storage directories
chmod -R 777 vision-tech-backend/storage
```

## Development

This implementation provides a solid foundation that you can further extend and customize as needed.