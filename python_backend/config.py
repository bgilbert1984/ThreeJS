from pathlib import Path
from dotenv import load_dotenv
import os

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# API Keys with fallbacks to None
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

def validate_config():
    """Validate that all required environment variables are set"""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")