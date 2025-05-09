# scripts/init_db.py
import os
import sys
import logging
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Add parent directory to path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_db_if_not_exists() -> None:
    """Create the PostgreSQL database if it doesn't exist."""
    from app.core.config import settings
    
    # Get PostgreSQL connection parameters
    DB_USER = settings.POSTGRES_USER
    DB_PASSWORD = settings.POSTGRES_PASSWORD
    DB_HOST = settings.POSTGRES_SERVER
    DB_NAME = settings.POSTGRES_DB
    
    logger.info(f"Checking if database '{DB_NAME}' exists")
    
    try:
        # Connect to PostgreSQL server
        conn = psycopg2.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            # Connect to 'postgres' database to check if our target DB exists
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        exists = cursor.fetchone()
        
        if not exists:
            logger.info(f"Database '{DB_NAME}' does not exist. Creating...")
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            logger.info(f"Database '{DB_NAME}' created successfully")
        else:
            logger.info(f"Database '{DB_NAME}' already exists")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        logger.error(f"Error checking/creating database: {e}")
        raise

def main() -> None:
    """Initialize the database with schema and default data."""
    logger.info("Starting database initialization")
    
    try:
        # First ensure the database exists
        create_db_if_not_exists()
        
        # Import the init_db function
        from app.db.init_db import init_db
        logger.info("Creating tables and initializing data...")
        
        # Run initialization
        init_db()
        
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Error during initialization: {e}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    main()