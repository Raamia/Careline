"""
Agent cards for A2A protocol discovery.

Each agent card describes the capabilities and endpoints of CareLine agents,
enabling automatic discovery and communication via the A2A protocol.
"""

from typing import Dict, Any, List
from config import get_agent_url

def generate_agent_cards() -> Dict[str, Dict[str, Any]]:
    """Generate agent cards for all CareLine agents"""
    
    agent_cards = {
        "orchestrator": {
            "name": "OrchestratorAgent",
            "description": "Central orchestrator for CareLine medical referral system",
            "url": get_agent_url("orchestrator"),
            "version": "1.0.0",
            "capabilities": [
                "referral_orchestration",
                "parallel_agent_coordination", 
                "decision_card_generation"
            ],
            "skills": [
                {
                    "id": "referral_orchestration",
                    "name": "Referral Orchestration",
                    "description": "Coordinates the complete referral processing workflow",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "referral_id": {"type": "string"},
                            "patient_id": {"type": "string"},
                            "specialty": {"type": "string"}
                        },
                        "required": ["referral_id", "patient_id", "specialty"]
                    }
                }
            ],
            "endpoints": {
                "process_referral_created": "/a2a/OrchestratorAgent/process_referral_created",
                "get_orchestration_status": "/a2a/OrchestratorAgent/get_orchestration_status"
            }
        },
        
        "directory": {
            "name": "DirectoryAgent", 
            "description": "Provider directory search agent for medical referrals",
            "url": get_agent_url("directory"),
            "version": "1.0.0",
            "capabilities": [
                "provider_search",
                "insurance_filtering",
                "provider_ranking"
            ],
            "skills": [
                {
                    "id": "provider_search",
                    "name": "Provider Search",
                    "description": "Search medical providers by specialty and location",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "referral_id": {"type": "string"},
                            "specialty": {"type": "string"},
                            "patient_id": {"type": "string"},
                            "zip_code": {"type": "string", "optional": True}
                        },
                        "required": ["referral_id", "specialty", "patient_id"]
                    }
                }
            ],
            "endpoints": {
                "find_providers": "/a2a/DirectoryAgent/find_providers",
                "get_provider_details": "/a2a/DirectoryAgent/get_provider_details"
            }
        },
        
        "availability": {
            "name": "AvailabilityAgent",
            "description": "Appointment availability management agent",
            "url": get_agent_url("availability"), 
            "version": "1.0.0",
            "capabilities": [
                "availability_search",
                "appointment_booking",
                "schedule_management"
            ],
            "skills": [
                {
                    "id": "availability_search",
                    "name": "Availability Search",
                    "description": "Find available appointment slots for providers",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "referral_id": {"type": "string"},
                            "provider_ids": {"type": "array", "items": {"type": "string"}},
                            "urgency": {"type": "string", "enum": ["routine", "urgent", "stat"]}
                        },
                        "required": ["referral_id", "provider_ids"]
                    }
                }
            ],
            "endpoints": {
                "get_availability": "/a2a/AvailabilityAgent/get_availability",
                "book_appointment": "/a2a/AvailabilityAgent/book_appointment"
            }
        },
        
        "cost": {
            "name": "CostAgent",
            "description": "Medical cost estimation and insurance verification agent",
            "url": get_agent_url("cost"),
            "version": "1.0.0", 
            "capabilities": [
                "cost_estimation",
                "insurance_verification",
                "network_checking"
            ],
            "skills": [
                {
                    "id": "cost_estimation",
                    "name": "Cost Estimation",
                    "description": "Estimate out-of-pocket costs for medical procedures",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "referral_id": {"type": "string"},
                            "providers": {"type": "array"},
                            "patient_insurance": {"type": "object", "optional": True}
                        },
                        "required": ["referral_id", "providers"]
                    }
                }
            ],
            "endpoints": {
                "estimate_costs": "/a2a/CostAgent/estimate_costs",
                "verify_insurance": "/a2a/CostAgent/verify_insurance"
            }
        },
        
        "records": {
            "name": "RecordsAgent",
            "description": "Medical record parsing and normalization agent",
            "url": get_agent_url("records"),
            "version": "1.0.0",
            "capabilities": [
                "record_parsing",
                "fhir_conversion", 
                "data_extraction"
            ],
            "skills": [
                {
                    "id": "record_parsing",
                    "name": "Medical Record Parsing",
                    "description": "Parse and normalize medical records to FHIR-lite format",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "referral_id": {"type": "string"},
                            "patient_id": {"type": "string"},
                            "record_sources": {"type": "array", "optional": True}
                        },
                        "required": ["referral_id", "patient_id"]
                    }
                }
            ],
            "endpoints": {
                "parse_records": "/a2a/RecordsAgent/parse_records",
                "extract_entities": "/a2a/RecordsAgent/extract_entities"
            }
        },
        
        "summarizer": {
            "name": "SummarizerAgent",
            "description": "AI-powered medical summary generation agent using Gemini",
            "url": get_agent_url("summarizer"),
            "version": "1.0.0",
            "capabilities": [
                "clinical_summarization",
                "patient_explanation",
                "ai_generation"
            ],
            "skills": [
                {
                    "id": "clinical_summarization",
                    "name": "Clinical Summarization",
                    "description": "Generate clinical briefs and patient explainers using AI",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "referral_id": {"type": "string"},
                            "patient_id": {"type": "string"},
                            "referral": {"type": "object"},
                            "medical_record": {"type": "object", "optional": True}
                        },
                        "required": ["referral_id", "patient_id", "referral"]
                    }
                }
            ],
            "endpoints": {
                "generate_summaries": "/a2a/SummarizerAgent/generate_summaries",
                "regenerate_summaries": "/a2a/SummarizerAgent/regenerate_summaries"
            }
        },
        
        "loop": {
            "name": "LoopAgent",
            "description": "Continuous monitoring agent for medical record updates",
            "url": get_agent_url("loop"),
            "version": "1.0.0",
            "capabilities": [
                "continuous_monitoring",
                "change_detection",
                "notification_management"
            ],
            "skills": [
                {
                    "id": "continuous_monitoring",
                    "name": "Continuous Monitoring",
                    "description": "24/7 monitoring of patient medical records for updates",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "patient_id": {"type": "string"},
                            "referral_id": {"type": "string", "optional": True},
                            "critical_thresholds": {"type": "object", "optional": True}
                        },
                        "required": ["patient_id"]
                    }
                }
            ],
            "endpoints": {
                "process_records_updated": "/a2a/LoopAgent/process_records_updated",
                "start_monitoring": "/a2a/LoopAgent/start_monitoring",
                "stop_monitoring": "/a2a/LoopAgent/stop_monitoring"
            }
        }
    }
    
    return agent_cards

def save_agent_cards():
    """Save agent cards to JSON files for A2A discovery"""
    import json
    import os
    
    agent_cards = generate_agent_cards()
    
    # Create cards directory
    cards_dir = "configs/cards"
    os.makedirs(cards_dir, exist_ok=True)
    
    # Save individual agent cards
    for agent_name, card_data in agent_cards.items():
        card_file = os.path.join(cards_dir, f"{agent_name}_agent.json")
        with open(card_file, 'w') as f:
            json.dump(card_data, f, indent=2)
    
    # Save combined registry
    registry_file = os.path.join(cards_dir, "agent_registry.json")
    with open(registry_file, 'w') as f:
        json.dump({
            "registry": agent_cards,
            "updated_at": "2024-01-01T00:00:00Z",
            "version": "1.0.0"
        }, f, indent=2)
    
    print(f"Agent cards saved to {cards_dir}/")

if __name__ == "__main__":
    save_agent_cards()
