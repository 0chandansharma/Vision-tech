import os

# Define the base directory
base_dir = "vision-tech-frontend"

# Directory structure with files
structure = {
    "public": [
        "index.html",
        "favicon.ico",
        "assets/images/logo.svg"
    ],
    "src": [
        "index.tsx",
        "App.tsx",
        "routes.tsx",
        "types/user.types.ts",
        "types/project.types.ts",
        "types/video.types.ts",
        "types/detection.types.ts",
        "api/axiosConfig.ts",
        "api/authApi.ts",
        "api/projectsApi.ts",
        "api/videosApi.ts",
        "api/detectionApi.ts",
        "hooks/useAuth.ts",
        "hooks/useProjects.ts",
        "hooks/useVideoProcessing.ts",
        "store/index.ts",
        "store/auth/authSlice.ts",
        "store/auth/authSelectors.ts",
        "store/projects/projectsSlice.ts",
        "store/projects/projectsSelectors.ts",
        "store/videos/videosSlice.ts",
        "store/videos/videosSelectors.ts",
        "components/common/Layout/AppLayout.tsx",
        "components/common/Layout/Sidebar.tsx",
        "components/common/Layout/Header.tsx",
        "components/common/Layout/Footer.tsx",
        "components/common/Button/",
        "components/common/Inputs/",
        "components/common/Loaders/",
        "components/common/Notifications/",
        "components/auth/LoginForm.tsx",
        "components/auth/UserMenu.tsx",
        "components/projects/ProjectList.tsx",
        "components/projects/ProjectCard.tsx",
        "components/projects/ProjectCreation.tsx",
        "components/projects/ProjectDetails.tsx",
        "components/videos/VideoUpload.tsx",
        "components/videos/VideoList.tsx",
        "components/videos/VideoThumbnail.tsx",
        "components/detection/VideoPlayer.tsx",
        "components/detection/DetectionTimeline.tsx",
        "components/detection/DetectionFilters.tsx",
        "components/detection/ObjectThumbnails.tsx",
        "components/detection/ResultsExport.tsx",
        "pages/auth/LoginPage.tsx",
        "pages/auth/ForgotPasswordPage.tsx",
        "pages/dashboard/DashboardPage.tsx",
        "pages/projects/ProjectsListPage.tsx",
        "pages/projects/ProjectCreationPage.tsx",
        "pages/projects/ProjectDetailsPage.tsx",
        "pages/admin/UserManagementPage.tsx",
        "pages/admin/SystemMonitoringPage.tsx",
        "pages/errors/NotFoundPage.tsx",
        "pages/errors/ErrorPage.tsx",
        "utils/auth.utils.ts",
        "utils/date.utils.ts",
        "utils/file.utils.ts",
        "utils/video.utils.ts",
        "styles/index.css",
        "styles/variables.css",
        "styles/themes/default.ts",
        "styles/themes/dark.ts"
    ],
    "": [
        "package.json",
        "tsconfig.json",
        ".env",
        ".env.production",
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
