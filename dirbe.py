import os

# Define the base directory
base_dir = "vision-tech-backend"

# Directory structure with files
structure = {
    "app": [
        "__init__.py",
        "main.py",
        "config.py",
        "api/__init__.py",
        "api/deps.py",
        "api/auth.py",
        "api/users.py",
        "api/projects.py",
        "api/videos.py",
        "api/detection.py",
        "core/__init__.py",
        "core/security.py",
        "core/config.py",
        "core/exceptions.py",
        "db/__init__.py",
        "db/session.py",
        "db/base.py",
        "db/init_db.py",
        "models/__init__.py",
        "models/user.py",
        "models/role.py",
        "models/project.py",
        "models/video.py",
        "models/detection.py",
        "schemas/__init__.py",
        "schemas/user.py",
        "schemas/project.py",
        "schemas/video.py",
        "schemas/detection.py",
        "services/__init__.py",
        "services/auth.py",
        "services/user.py",
        "services/project.py",
        "services/video.py",
        "services/detection/__init__.py",
        "services/detection/yolo.py",
        "services/detection/motion.py",
        "tasks/__init__.py",
        "tasks/worker.py",
        "tasks/video_processing.py",
        "tasks/detection.py",
        "utils/__init__.py",
        "utils/file_storage.py",
        "utils/video.py",
        "utils/logging.py"
    ],
    "alembic": [
        "versions/",
        "env.py",
        "alembic.ini"
    ],
    "tests": [
        "__init__.py",
        "conftest.py",
        "test_api/__init__.py",
        "test_api/test_auth.py",
        "test_api/test_projects.py",
        "test_api/test_videos.py",
        "test_services/__init__.py",
        "test_services/test_auth.py",
        "test_services/test_detection.py"
    ],
    "docker": [
        "Dockerfile",
        "docker-compose.yml",
        "scripts/start.sh"
    ],
    "requirements": [
        "base.txt",
        "dev.txt",
        "prod.txt"
    ],
    "scripts": [
        "create_admin.py",
        "preload_models.py"
    ],
    "": [
        ".env.example",
        "pyproject.toml",
        "README.md"
    ]
}

# Function to create files and folders
def create_structure(base, tree):
    for folder, files in tree.items():
        for path in files:
            full_path = os.path.join(base, folder, path)
            dir_name = full_path if full_path.endswith("/") else os.path.dirname(full_path)
            os.makedirs(dir_name, exist_ok=True)
            if not full_path.endswith("/"):
                with open(full_path, 'w') as f:
                    pass  # Create empty file

# Run the structure creation
create_structure(base_dir, structure)

print(f"Project structure created under: {base_dir}")
