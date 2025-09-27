import os
from typing import Dict, Any

# Agent Configuration
AGENT_CONFIG = {
    "gemini_api_key": os.getenv("GEMINI_API_KEY"),
    "firebase_project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "firebase_client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "firebase_private_key": os.getenv("FIREBASE_PRIVATE_KEY"),
    "a2a_base_url": os.getenv("A2A_BASE_URL", "https://careline.select"),
    "log_level": os.getenv("LOG_LEVEL", "INFO")
}

# A2A Port Configuration
AGENT_PORTS = {
    "orchestrator": int(os.getenv("ORCHESTRATOR_PORT", 8000)),
    "directory": int(os.getenv("DIRECTORY_PORT", 8001)),
    "availability": int(os.getenv("AVAILABILITY_PORT", 8002)),
    "cost": int(os.getenv("COST_PORT", 8003)),
    "records": int(os.getenv("RECORDS_PORT", 8004)),
    "summarizer": int(os.getenv("SUMMARIZER_PORT", 8005)),
    "loop": int(os.getenv("LOOP_PORT", 8006))
}

# Agent URLs for A2A Communication
def get_agent_url(agent_name: str) -> str:
    base_url = AGENT_CONFIG["a2a_base_url"]
    port = AGENT_PORTS[agent_name]
    return f"{base_url}:{port}/a2a/{agent_name.title()}Agent"

# Logging Configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        },
    },
    "handlers": {
        "default": {
            "level": AGENT_CONFIG["log_level"],
            "formatter": "standard",
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "": {
            "handlers": ["default"],
            "level": AGENT_CONFIG["log_level"],
            "propagate": False
        }
    }
}
