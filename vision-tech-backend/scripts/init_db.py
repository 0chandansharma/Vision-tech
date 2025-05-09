# scripts/init_db.py
import os
import sys
import logging

# Add parent directory to path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main() -> None:
    """Initialize the database with default roles and admin user."""
    logger.info("Starting database initialization")
    
    try:
        # Import the init_db function
        from app.db.init_db import init_db
        logger.info("Running database initialization...")
        
        # Run initialization
        init_db()
        
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Error during initialization: {e}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    main()