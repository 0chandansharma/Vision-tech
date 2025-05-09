How to Run Your Vision Tech Platform

Here's a step-by-step guide to get your Vision Tech platform up and running:

Prerequisites

1. Make sure PostgreSQL is installed and running
2. Make sure MongoDB is installed and running
3. Have Python 3.8+ installed
4. Have Node.js 14+ installed

Setup Process

1. Backend Setup

# Navigate to backend directory

cd vision-tech-backend

# Install Python dependencies

pip install -r requirements.txt

# Initialize PostgreSQL database

python scripts/init_db.py

# Initialize MongoDB collections

python scripts/init_mongodb.py

# Download and preload YOLO models

python scripts/preload_models.py

# Start the backend server

uvicorn app.main:app --reload --port 8000

2. Frontend Setup

# Open a new terminal

# Navigate to frontend directory

cd vision-tech-frontend

# Install Node.js dependencies

npm install

# Start the frontend development server

npm start

Access the Application

- Frontend: Open your browser and go to http://localhost:3000
- Backend API: API is available at http://localhost:8000
- API Documentation: Swagger UI is available at http://localhost:8000/docs

Default Login

The system automatically creates a default admin user during initialization:

- Username: admin
- Password: adminpassword

Usage Flow

1. Log in with the admin credentials
2. Create a new project
3. Upload videos to the project
4. Run detection jobs using YOLO or motion detection
5. View and analyze the detection results
6. Export results as needed

Troubleshooting

- If PostgreSQL connection fails, check your database settings in app/core/config.py
- If MongoDB connection fails, ensure MongoDB is running on the default port
- For model loading issues, check the storage paths in app/core/config.py
