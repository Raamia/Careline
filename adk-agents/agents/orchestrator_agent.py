import asyncio
from typing import Dict, Any, List
from datetime import datetime

from adk.agent import LlmAgent
from pydantic import ValidationError

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base_agent import BaseCarLineAgent
from types import (
    A2AMessage, A2AResponse, ReferralCreatedEvent, AgentType, 
    DecisionCard, DirectoryAgentInput, RecordsAgentInput,
    AvailabilityAgentInput, CostAgentInput, SummarizerAgentInput
)
from config import AGENT_PORTS

class OrchestratorAgent(BaseCarLineAgent):
    """
    Central orchestrator agent that coordinates all other agents in the CareLine system.
    
    Responsibilities:
    - Receive referral.created events
    - Fan out parallel tasks to directory and records agents
    - Coordinate dependent tasks (availability, cost, summarizer)
    - Aggregate results into decision cards
    """
    
    def __init__(self):
        super().__init__(AgentType.ORCHESTRATOR, AGENT_PORTS["orchestrator"])
        
    def build_agent(self) -> LlmAgent:
        """Build the orchestrator LLM agent with ADK"""
        return LlmAgent(
            model="gemini-1.5-pro",
            name=self.agent_name,
            description="Central orchestrator for CareLine medical referral system",
            instruction="""
            You are the central orchestrator agent for CareLine, a medical referral system.
            
            Your role is to:
            1. Coordinate parallel agent execution for optimal performance
            2. Ensure all required data is gathered before making decisions
            3. Handle failures gracefully and provide meaningful error responses
            4. Aggregate results from multiple agents into cohesive decision cards
            
            Always prioritize patient safety and data accuracy in your orchestration.
            """,
            tools=list(self.remote_agents.values())
        )
    
    def _get_agent_skills(self) -> List[Dict[str, str]]:
        """Define orchestrator agent skills"""
        return [
            {
                "id": "referral_orchestration",
                "name": "Referral Orchestration",
                "description": "Coordinates the complete referral processing workflow"
            },
            {
                "id": "parallel_agent_coordination",
                "name": "Parallel Agent Coordination", 
                "description": "Manages parallel execution of directory and records agents"
            },
            {
                "id": "decision_card_generation",
                "name": "Decision Card Generation",
                "description": "Aggregates results from all agents into patient decision cards"
            }
        ]
    
    async def process_message(self, message: A2AMessage) -> A2AResponse:
        """Process incoming A2A messages"""
        try:
            if message.action == "process_referral_created":
                return await self._process_referral_created(message.data)
            elif message.action == "get_orchestration_status":
                return await self._get_orchestration_status(message.data)
            else:
                raise ValueError(f"Unknown action: {message.action}")
                
        except Exception as e:
            self.logger.error(f"Error processing message: {e}")
            return A2AResponse(
                message_id=message.id,
                success=False,
                error=str(e)
            )
    
    async def _process_referral_created(self, data: Dict[str, Any]) -> A2AResponse:
        """Process referral.created event by orchestrating all agents"""
        try:
            # Validate input event
            event = ReferralCreatedEvent(**data)
            self.logger.info(f"Processing referral created: {event.referral_id}")
            
            # Create orchestrator task
            task_id = await self.create_task(event.referral_id, data)
            
            # Phase 1: Parallel execution of directory and records agents
            phase1_messages = [
                {
                    "to_agent": "directory",
                    "action": "find_providers",
                    "data": DirectoryAgentInput(
                        referral_id=event.referral_id,
                        specialty=event.specialty,
                        patient_id=event.patient_id
                    ).dict(),
                    "correlation_id": task_id
                },
                {
                    "to_agent": "records", 
                    "action": "parse_records",
                    "data": RecordsAgentInput(
                        referral_id=event.referral_id,
                        patient_id=event.patient_id
                    ).dict(),
                    "correlation_id": task_id
                }
            ]
            
            self.logger.info("Starting Phase 1: Directory + Records agents")
            phase1_results = await self.send_parallel_messages(phase1_messages)
            
            # Check for Phase 1 failures
            directory_result = phase1_results[0]
            records_result = phase1_results[1]
            
            if not directory_result.success:
                raise Exception(f"Directory agent failed: {directory_result.error}")
            
            if not records_result.success:
                raise Exception(f"Records agent failed: {records_result.error}")
            
            providers = directory_result.data.get("providers", [])
            medical_record = records_result.data.get("medical_record")
            
            # Phase 2: Parallel execution of availability, cost, and summarizer agents
            phase2_messages = [
                {
                    "to_agent": "availability",
                    "action": "get_availability", 
                    "data": AvailabilityAgentInput(
                        referral_id=event.referral_id,
                        provider_ids=[p["id"] for p in providers]
                    ).dict(),
                    "correlation_id": task_id
                },
                {
                    "to_agent": "cost",
                    "action": "estimate_costs",
                    "data": CostAgentInput(
                        referral_id=event.referral_id,
                        providers=providers
                    ).dict(), 
                    "correlation_id": task_id
                },
                {
                    "to_agent": "summarizer",
                    "action": "generate_summaries",
                    "data": SummarizerAgentInput(
                        referral_id=event.referral_id,
                        patient_id=event.patient_id,
                        referral=data.get("referral", {}),
                        medical_record=medical_record
                    ).dict(),
                    "correlation_id": task_id
                }
            ]
            
            self.logger.info("Starting Phase 2: Availability + Cost + Summarizer agents")
            phase2_results = await self.send_parallel_messages(phase2_messages)
            
            # Process Phase 2 results (more tolerant of failures)
            availability_result = phase2_results[0]
            cost_result = phase2_results[1] 
            summarizer_result = phase2_results[2]
            
            # Aggregate results into decision card
            decision_card_data = {
                "referral_id": event.referral_id,
                "providers": providers,
                "availability": availability_result.data.get("availability", []) if availability_result.success else [],
                "cost_estimates": cost_result.data.get("estimates", []) if cost_result.success else [],
                "patient_explainer": summarizer_result.data.get("patient_explainer") if summarizer_result.success else None,
                "created_at": datetime.now().isoformat()
            }
            
            # Update task status
            await self.update_task_status(task_id, "completed", {
                "decision_card": decision_card_data,
                "phase1_success": True,
                "phase2_successes": {
                    "availability": availability_result.success,
                    "cost": cost_result.success, 
                    "summarizer": summarizer_result.success
                }
            })
            
            self.logger.info(f"Successfully orchestrated referral {event.referral_id}")
            
            return A2AResponse(
                message_id="",
                success=True,
                data={
                    "task_id": task_id,
                    "decision_card": decision_card_data,
                    "message": "Referral processing orchestrated successfully"
                }
            )
            
        except Exception as e:
            self.logger.error(f"Error in referral orchestration: {e}")
            if 'task_id' in locals():
                await self.update_task_status(task_id, "failed", error=str(e))
            
            return A2AResponse(
                message_id="",
                success=False,
                error=str(e)
            )
    
    async def _get_orchestration_status(self, data: Dict[str, Any]) -> A2AResponse:
        """Get status of referral orchestration"""
        referral_id = data.get("referral_id")
        
        if not referral_id:
            return A2AResponse(
                message_id="", 
                success=False,
                error="referral_id required"
            )
        
        # In a real implementation, this would query the task database
        return A2AResponse(
            message_id="",
            success=True,
            data={
                "referral_id": referral_id,
                "status": "completed", 
                "tasks_completed": 6,
                "total_tasks": 6,
                "last_updated": datetime.now().isoformat()
            }
        )

# Agent server entry point
async def start_orchestrator_agent():
    """Start the orchestrator agent A2A server"""
    from adk.api_server import start_a2a_server
    
    orchestrator = OrchestratorAgent()
    agent = orchestrator.build_agent()
    
    # Start A2A server
    await start_a2a_server(
        agent=agent,
        port=AGENT_PORTS["orchestrator"],
        agent_card=orchestrator.get_agent_card()
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
    asyncio.run(start_orchestrator_agent())
