import asyncio
from typing import Dict, Any, List
from datetime import datetime

from adk.agent import LlmAgent

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base_agent import BaseCarLineAgent
from types import (
    A2AMessage, A2AResponse, AgentType, Provider,
    DirectoryAgentInput, DirectoryAgentOutput
)
from config import AGENT_PORTS

class DirectoryAgent(BaseCarLineAgent):
    """
    Directory agent responsible for finding medical providers based on specialty and location.
    
    Responsibilities:
    - Search provider database by specialty
    - Filter by insurance networks and availability
    - Return ranked list of providers by distance and rating
    """
    
    def __init__(self):
        super().__init__(AgentType.DIRECTORY, AGENT_PORTS["directory"])
        
        # Mock provider database (in production, this would be an external API)
        self.provider_database = self._initialize_provider_database()
        
    def build_agent(self) -> LlmAgent:
        """Build the directory LLM agent with ADK"""
        return LlmAgent(
            model="gemini-1.5-pro",
            name=self.agent_name,
            description="Provider directory search agent for medical referrals",
            instruction="""
            You are a specialized agent for finding medical providers in the CareLine system.
            
            Your capabilities include:
            1. Searching providers by medical specialty
            2. Filtering by insurance network participation
            3. Ranking providers by distance, ratings, and availability
            4. Ensuring all returned providers accept new patients
            
            Always prioritize patient needs and ensure accurate provider information.
            Focus on in-network providers to minimize patient costs.
            """,
            tools=[]
        )
    
    def _get_agent_skills(self) -> List[Dict[str, str]]:
        """Define directory agent skills"""
        return [
            {
                "id": "provider_search",
                "name": "Provider Search",
                "description": "Search medical providers by specialty and location"
            },
            {
                "id": "insurance_filtering", 
                "name": "Insurance Network Filtering",
                "description": "Filter providers by insurance network participation"
            },
            {
                "id": "provider_ranking",
                "name": "Provider Ranking",
                "description": "Rank providers by distance, ratings, and availability"
            }
        ]
    
    def _initialize_provider_database(self) -> List[Provider]:
        """Initialize mock provider database"""
        return [
            Provider(
                id="provider-cardio-001",
                name="Dr. Sarah Chen",
                npi_number="1234567890",
                specialty="Cardiology",
                practice="Heart & Vascular Institute",
                address={
                    "street": "123 Medical Drive",
                    "city": "San Francisco", 
                    "state": "CA",
                    "zipCode": "94102"
                },
                phone="(555) 123-4567",
                email="schen@heartinstitute.com",
                distance_km=2.5,
                in_network=True,
                rating=4.8,
                accepting_new_patients=True
            ),
            Provider(
                id="provider-cardio-002", 
                name="Dr. Michael Rodriguez",
                npi_number="1234567891",
                specialty="Cardiology",
                practice="Bay Area Cardiology",
                address={
                    "street": "456 Health Plaza",
                    "city": "San Francisco",
                    "state": "CA", 
                    "zipCode": "94105"
                },
                phone="(555) 987-6543",
                email="mrodriguez@bayareacardio.com", 
                distance_km=4.2,
                in_network=True,
                rating=4.7,
                accepting_new_patients=True
            ),
            Provider(
                id="provider-cardio-003",
                name="Dr. Jennifer Kim", 
                npi_number="1234567892",
                specialty="Cardiology",
                practice="UCSF Cardiology",
                address={
                    "street": "789 Parnassus Ave",
                    "city": "San Francisco",
                    "state": "CA",
                    "zipCode": "94143"
                },
                phone="(555) 456-7890",
                email="jkim@ucsf.edu",
                distance_km=3.8,
                in_network=True,
                rating=4.9,
                accepting_new_patients=True
            ),
            Provider(
                id="provider-derm-001",
                name="Dr. Alex Thompson",
                npi_number="1234567893", 
                specialty="Dermatology",
                practice="SF Dermatology Center",
                address={
                    "street": "321 Market Street",
                    "city": "San Francisco",
                    "state": "CA",
                    "zipCode": "94102"
                },
                phone="(555) 234-5678",
                email="athompson@sfdermatology.com",
                distance_km=1.2,
                in_network=True,
                rating=4.6,
                accepting_new_patients=True
            ),
            Provider(
                id="provider-ortho-001",
                name="Dr. Lisa Park",
                npi_number="1234567894",
                specialty="Orthopedics",
                practice="Bay Area Orthopedics", 
                address={
                    "street": "654 Mission Street",
                    "city": "San Francisco",
                    "state": "CA",
                    "zipCode": "94105"
                },
                phone="(555) 345-6789",
                email="lpark@bayortho.com",
                distance_km=2.1,
                in_network=True,
                rating=4.7,
                accepting_new_patients=True
            )
        ]
    
    async def process_message(self, message: A2AMessage) -> A2AResponse:
        """Process incoming A2A messages"""
        try:
            if message.action == "find_providers":
                return await self._find_providers(message.data)
            elif message.action == "get_provider_details":
                return await self._get_provider_details(message.data)
            else:
                raise ValueError(f"Unknown action: {message.action}")
                
        except Exception as e:
            self.logger.error(f"Error processing message: {e}")
            return A2AResponse(
                message_id=message.id,
                success=False,
                error=str(e)
            )
    
    async def _find_providers(self, data: Dict[str, Any]) -> A2AResponse:
        """Find providers based on specialty and other criteria"""
        try:
            # Validate input
            input_data = DirectoryAgentInput(**data)
            self.logger.info(f"Finding providers for specialty: {input_data.specialty}")
            
            # Create task for tracking
            task_id = await self.create_task(input_data.referral_id, data)
            
            # Simulate API delay (in production, this would be external API calls)
            await asyncio.sleep(1.0)
            
            # Filter providers by specialty
            matching_providers = [
                provider for provider in self.provider_database
                if provider.specialty.lower() == input_data.specialty.lower()
            ]
            
            # Filter by accepting new patients
            matching_providers = [
                provider for provider in matching_providers
                if provider.accepting_new_patients
            ]
            
            # Filter by in-network status
            matching_providers = [
                provider for provider in matching_providers
                if provider.in_network
            ]
            
            # Sort by distance and rating
            matching_providers.sort(key=lambda p: (
                p.distance_km or 999,  # Distance first
                -(p.rating or 0)       # Then rating (descending)
            ))
            
            # Limit to top 5 results
            selected_providers = matching_providers[:5]
            
            self.logger.info(f"Found {len(selected_providers)} providers for {input_data.specialty}")
            
            # Prepare output
            output = DirectoryAgentOutput(providers=selected_providers)
            
            # Update task status
            await self.update_task_status(task_id, "completed", {
                "provider_count": len(selected_providers),
                "specialty": input_data.specialty
            })
            
            return A2AResponse(
                message_id="",
                success=True,
                data=output.dict()
            )
            
        except Exception as e:
            self.logger.error(f"Error finding providers: {e}")
            if 'task_id' in locals():
                await self.update_task_status(task_id, "failed", error=str(e))
            
            return A2AResponse(
                message_id="",
                success=False,
                error=str(e)
            )
    
    async def _get_provider_details(self, data: Dict[str, Any]) -> A2AResponse:
        """Get detailed information about a specific provider"""
        try:
            provider_id = data.get("provider_id")
            if not provider_id:
                raise ValueError("provider_id required")
            
            # Find provider in database
            provider = next(
                (p for p in self.provider_database if p.id == provider_id),
                None
            )
            
            if not provider:
                raise ValueError(f"Provider {provider_id} not found")
            
            return A2AResponse(
                message_id="",
                success=True,
                data={"provider": provider.dict()}
            )
            
        except Exception as e:
            self.logger.error(f"Error getting provider details: {e}")
            return A2AResponse(
                message_id="",
                success=False,
                error=str(e)
            )

# Agent server entry point
async def start_directory_agent():
    """Start the directory agent A2A server"""
    from adk.api_server import start_a2a_server
    
    directory = DirectoryAgent()
    agent = directory.build_agent()
    
    # Start A2A server
    await start_a2a_server(
        agent=agent,
        port=AGENT_PORTS["directory"],
        agent_card=directory.get_agent_card()
    )

if __name__ == "__main__":
    import os
    import logging.config
    from config import LOGGING_CONFIG
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Setup logging
    logging.config.dictConfig(LOGGING_CONFIG)
    
    # Start the agent
    asyncio.run(start_directory_agent())
