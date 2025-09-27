import logging
import asyncio
from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from datetime import datetime

from adk.agent import LlmAgent, RemoteA2aAgent
from pydantic import BaseModel

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from types import A2AMessage, A2AResponse, AgentTask, TaskStatus, AgentType
from config import AGENT_CONFIG, get_agent_url

logger = logging.getLogger(__name__)

class BaseCarLineAgent(ABC):
    """Base class for all CareLine agents using Google ADK"""
    
    def __init__(self, agent_type: AgentType, port: int):
        self.agent_type = agent_type
        self.port = port
        self.agent_name = f"{agent_type.value.title()}Agent"
        self.logger = logging.getLogger(f"careline.{agent_type.value}")
        
        # Initialize remote agent connections
        self.remote_agents: Dict[str, RemoteA2aAgent] = {}
        self._setup_remote_agents()
        
    def _setup_remote_agents(self):
        """Setup connections to other agents via A2A protocol"""
        agent_types = ["orchestrator", "directory", "availability", "cost", "records", "summarizer", "loop"]
        
        for agent_type in agent_types:
            if agent_type != self.agent_type.value:
                try:
                    url = get_agent_url(agent_type)
                    self.remote_agents[agent_type] = RemoteA2aAgent(url=url)
                    self.logger.info(f"Connected to {agent_type} agent at {url}")
                except Exception as e:
                    self.logger.warning(f"Failed to connect to {agent_type} agent: {e}")
    
    @abstractmethod
    def build_agent(self) -> LlmAgent:
        """Build and return the ADK LlmAgent instance"""
        pass
    
    @abstractmethod
    async def process_message(self, message: A2AMessage) -> A2AResponse:
        """Process incoming A2A messages"""
        pass
    
    async def send_message(self, to_agent: str, action: str, data: Dict[str, Any], 
                          correlation_id: Optional[str] = None) -> A2AResponse:
        """Send message to another agent via A2A protocol"""
        try:
            if to_agent not in self.remote_agents:
                raise ValueError(f"Agent {to_agent} not connected")
            
            message = A2AMessage(
                from_agent=self.agent_name,
                to_agent=to_agent,
                action=action,
                data=data,
                correlation_id=correlation_id
            )
            
            self.logger.info(f"Sending message to {to_agent}: {action}")
            
            # Use the remote agent to send the message
            remote_agent = self.remote_agents[to_agent]
            response = await remote_agent.process(message.dict())
            
            return A2AResponse(
                message_id=message.id,
                success=True,
                data=response
            )
            
        except Exception as e:
            self.logger.error(f"Failed to send message to {to_agent}: {e}")
            return A2AResponse(
                message_id=message.id,
                success=False,
                error=str(e)
            )
    
    async def send_parallel_messages(self, messages: List[Dict[str, Any]]) -> List[A2AResponse]:
        """Send multiple messages in parallel"""
        tasks = []
        for msg in messages:
            task = self.send_message(
                to_agent=msg["to_agent"],
                action=msg["action"],
                data=msg["data"],
                correlation_id=msg.get("correlation_id")
            )
            tasks.append(task)
        
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    async def create_task(self, referral_id: str, inputs: Dict[str, Any]) -> str:
        """Create a new agent task for tracking"""
        task = AgentTask(
            id=f"task_{self.agent_type.value}_{datetime.now().timestamp()}",
            type=self.agent_type,
            referral_id=referral_id,
            status=TaskStatus.RUNNING,
            inputs=inputs,
            created_at=datetime.now()
        )
        
        # In a real implementation, this would save to database
        self.logger.info(f"Created task {task.id} for referral {referral_id}")
        return task.id
    
    async def update_task_status(self, task_id: str, status: TaskStatus, 
                                outputs: Optional[Dict[str, Any]] = None,
                                error: Optional[str] = None):
        """Update task status and outputs"""
        self.logger.info(f"Task {task_id} status: {status.value}")
        
        if outputs:
            self.logger.debug(f"Task {task_id} outputs: {outputs}")
        
        if error:
            self.logger.error(f"Task {task_id} error: {error}")
    
    def get_agent_card(self) -> Dict[str, Any]:
        """Generate agent card for A2A discovery"""
        return {
            "name": self.agent_name,
            "description": f"CareLine {self.agent_type.value.title()} Agent",
            "url": get_agent_url(self.agent_type.value),
            "version": "1.0.0",
            "skills": self._get_agent_skills()
        }
    
    @abstractmethod
    def _get_agent_skills(self) -> List[Dict[str, str]]:
        """Return list of agent skills for the agent card"""
        pass
    
    async def health_check(self) -> Dict[str, Any]:
        """Agent health check endpoint"""
        return {
            "agent": self.agent_name,
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "remote_agents": {
                name: "connected" if name in self.remote_agents else "disconnected"
                for name in ["orchestrator", "directory", "availability", "cost", "records", "summarizer", "loop"]
                if name != self.agent_type.value
            }
        }
