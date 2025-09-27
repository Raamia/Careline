import asyncio
from typing import Dict, Any, List
from datetime import datetime, timedelta

from adk.agent import LlmAgent

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base_agent import BaseCarLineAgent
from types import (
    A2AMessage, A2AResponse, AgentType, RecordsUpdatedEvent,
    SummarizerAgentInput, ClinicianBrief
)
from config import AGENT_PORTS

class LoopAgent(BaseCarLineAgent):
    """
    Loop agent for continuous monitoring and updates in the CareLine system.
    
    Responsibilities:
    - Monitor for medical record updates
    - Trigger re-summarization when records change
    - Send notifications for significant changes
    - Maintain continuous surveillance for critical values
    """
    
    def __init__(self):
        super().__init__(AgentType.LOOP, AGENT_PORTS["loop"])
        
        # Track active monitoring sessions
        self.active_monitors: Dict[str, Dict[str, Any]] = {}
        
        # Background task for continuous monitoring
        self.monitoring_task = None
        
    def build_agent(self) -> LlmAgent:
        """Build the loop LLM agent with ADK"""
        return LlmAgent(
            model="gemini-1.5-pro", 
            name=self.agent_name,
            description="Continuous monitoring agent for medical record updates",
            instruction="""
            You are a continuous monitoring agent for the CareLine medical system.
            
            Your responsibilities include:
            1. Monitoring patient medical records for updates
            2. Detecting significant changes that require physician notification
            3. Triggering re-summarization when records are updated
            4. Maintaining 24/7 surveillance for critical lab values
            5. Coordinating real-time updates across the system
            
            Patient safety is your top priority. Always escalate critical findings immediately.
            """,
            tools=list(self.remote_agents.values())
        )
    
    def _get_agent_skills(self) -> List[Dict[str, str]]:
        """Define loop agent skills"""
        return [
            {
                "id": "continuous_monitoring",
                "name": "Continuous Monitoring",
                "description": "24/7 monitoring of patient medical records for updates"
            },
            {
                "id": "change_detection",
                "name": "Change Detection", 
                "description": "Detect significant changes in medical records"
            },
            {
                "id": "notification_management",
                "name": "Notification Management",
                "description": "Send notifications for critical updates"
            },
            {
                "id": "summary_refresh",
                "name": "Summary Refresh",
                "description": "Trigger re-summarization when records change"
            }
        ]
    
    async def process_message(self, message: A2AMessage) -> A2AResponse:
        """Process incoming A2A messages"""
        try:
            if message.action == "process_records_updated":
                return await self._process_records_updated(message.data)
            elif message.action == "start_monitoring":
                return await self._start_monitoring(message.data)
            elif message.action == "stop_monitoring":
                return await self._stop_monitoring(message.data)
            elif message.action == "get_monitoring_status":
                return await self._get_monitoring_status(message.data)
            else:
                raise ValueError(f"Unknown action: {message.action}")
                
        except Exception as e:
            self.logger.error(f"Error processing message: {e}")
            return A2AResponse(
                message_id=message.id,
                success=False,
                error=str(e)
            )
    
    async def _process_records_updated(self, data: Dict[str, Any]) -> A2AResponse:
        """Process records.updated event"""
        try:
            # Validate input event
            event = RecordsUpdatedEvent(**data)
            self.logger.info(f"Processing records updated for patient: {event.patient_id}")
            
            # Create task for tracking
            task_id = await self.create_task(
                event.referral_id or "unknown", 
                data
            )
            
            # Find all active referrals for this patient
            active_referrals = await self._get_active_referrals(event.patient_id)
            
            if not active_referrals:
                self.logger.info(f"No active referrals found for patient {event.patient_id}")
                await self.update_task_status(task_id, "completed", {
                    "message": "No active referrals to update"
                })
                return A2AResponse(
                    message_id="",
                    success=True,
                    data={"message": "No active referrals to update"}
                )
            
            # Process each active referral
            update_results = []
            
            for referral in active_referrals:
                try:
                    # Get existing summary for comparison
                    existing_brief = await self._get_existing_brief(referral["id"])
                    
                    # Trigger re-summarization
                    summarizer_response = await self.send_message(
                        to_agent="summarizer",
                        action="generate_summaries",
                        data=SummarizerAgentInput(
                            referral_id=referral["id"],
                            patient_id=event.patient_id,
                            referral=referral
                        ).dict(),
                        correlation_id=task_id
                    )
                    
                    if summarizer_response.success:
                        new_brief = summarizer_response.data.get("clinician_brief")
                        
                        # Detect significant changes
                        has_significant_changes = await self._detect_significant_changes(
                            existing_brief, new_brief
                        )
                        
                        if has_significant_changes:
                            # Send notification for significant changes
                            await self._send_update_notification(referral["id"], event.patient_id)
                        
                        update_results.append({
                            "referral_id": referral["id"],
                            "updated": True,
                            "has_significant_changes": has_significant_changes
                        })
                    else:
                        update_results.append({
                            "referral_id": referral["id"],
                            "updated": False,
                            "error": summarizer_response.error
                        })
                        
                except Exception as e:
                    self.logger.error(f"Error updating referral {referral['id']}: {e}")
                    update_results.append({
                        "referral_id": referral["id"],
                        "updated": False,
                        "error": str(e)
                    })
            
            # Calculate summary statistics
            successful_updates = [r for r in update_results if r["updated"]]
            significant_changes = [r for r in successful_updates if r.get("has_significant_changes")]
            
            self.logger.info(f"Updated {len(successful_updates)} referrals, {len(significant_changes)} with significant changes")
            
            # Update task status
            await self.update_task_status(task_id, "completed", {
                "referrals_processed": len(active_referrals),
                "successful_updates": len(successful_updates), 
                "significant_changes": len(significant_changes),
                "results": update_results
            })
            
            return A2AResponse(
                message_id="",
                success=True,
                data={
                    "referrals_processed": len(active_referrals),
                    "successful_updates": len(successful_updates),
                    "significant_changes": len(significant_changes),
                    "results": update_results
                }
            )
            
        except Exception as e:
            self.logger.error(f"Error processing records updated: {e}")
            if 'task_id' in locals():
                await self.update_task_status(task_id, "failed", error=str(e))
            
            return A2AResponse(
                message_id="",
                success=False,
                error=str(e)
            )
    
    async def _start_monitoring(self, data: Dict[str, Any]) -> A2AResponse:
        """Start continuous monitoring for a patient or referral"""
        try:
            patient_id = data.get("patient_id")
            referral_id = data.get("referral_id")
            
            if not patient_id:
                raise ValueError("patient_id required")
            
            monitor_key = referral_id if referral_id else patient_id
            
            # Set up monitoring configuration
            self.active_monitors[monitor_key] = {
                "patient_id": patient_id,
                "referral_id": referral_id,
                "started_at": datetime.now(),
                "last_check": datetime.now(),
                "check_interval": timedelta(minutes=30),  # Check every 30 minutes
                "critical_thresholds": data.get("critical_thresholds", {})
            }
            
            # Start background monitoring if not already running
            if not self.monitoring_task or self.monitoring_task.done():
                self.monitoring_task = asyncio.create_task(self._continuous_monitoring_loop())
            
            self.logger.info(f"Started monitoring for {monitor_key}")
            
            return A2AResponse(
                message_id="",
                success=True,
                data={
                    "monitor_key": monitor_key,
                    "message": f"Monitoring started for {monitor_key}"
                }
            )
            
        except Exception as e:
            self.logger.error(f"Error starting monitoring: {e}")
            return A2AResponse(
                message_id="",
                success=False,
                error=str(e)
            )
    
    async def _continuous_monitoring_loop(self):
        """Background task for continuous monitoring"""
        self.logger.info("Starting continuous monitoring loop")
        
        while True:
            try:
                current_time = datetime.now()
                
                # Check each active monitor
                for monitor_key, monitor_config in list(self.active_monitors.items()):
                    last_check = monitor_config["last_check"]
                    check_interval = monitor_config["check_interval"]
                    
                    # Check if it's time for this monitor
                    if current_time - last_check >= check_interval:
                        await self._perform_monitoring_check(monitor_key, monitor_config)
                        monitor_config["last_check"] = current_time
                
                # Sleep for 1 minute before next iteration
                await asyncio.sleep(60)
                
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(60)  # Continue monitoring despite errors
    
    async def _perform_monitoring_check(self, monitor_key: str, monitor_config: Dict[str, Any]):
        """Perform a single monitoring check"""
        try:
            patient_id = monitor_config["patient_id"]
            
            # In a real implementation, this would:
            # 1. Check for new lab results
            # 2. Check for medication changes  
            # 3. Check for new clinical notes
            # 4. Compare against critical thresholds
            
            self.logger.debug(f"Performing monitoring check for {monitor_key}")
            
            # Mock check - in production, would query medical record systems
            # For demo, we'll randomly trigger an update 1% of the time
            import random
            if random.random() < 0.01:  # 1% chance of update
                self.logger.info(f"Detected potential record update for {monitor_key}")
                
                # Trigger records updated event
                await self.send_message(
                    to_agent="loop",  # Send to ourselves
                    action="process_records_updated",
                    data={
                        "type": "records.updated",
                        "patient_id": patient_id,
                        "referral_id": monitor_config.get("referral_id"),
                        "timestamp": datetime.now().isoformat()
                    }
                )
                
        except Exception as e:
            self.logger.error(f"Error in monitoring check for {monitor_key}: {e}")
    
    async def _get_active_referrals(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get active referrals for a patient"""
        # In a real implementation, this would query the referral database
        # For now, return mock data
        return [
            {
                "id": f"referral-{patient_id}-001",
                "patient_id": patient_id,
                "specialty": "Cardiology",
                "status": "pending"
            }
        ]
    
    async def _get_existing_brief(self, referral_id: str) -> Dict[str, Any]:
        """Get existing clinical brief for comparison"""
        # In a real implementation, this would query the summary database
        return {}
    
    async def _detect_significant_changes(self, old_brief: Dict[str, Any], new_brief: Dict[str, Any]) -> bool:
        """Detect if there are significant changes between briefs"""
        if not old_brief:
            return True  # First time generating
        
        # Check for new red flags
        old_red_flags = old_brief.get("red_flags", [])
        new_red_flags = new_brief.get("red_flags", [])
        has_new_red_flags = any(flag for flag in new_red_flags if flag not in old_red_flags)
        
        # Check for new problems
        old_problems = old_brief.get("problem_list", [])
        new_problems = new_brief.get("problem_list", [])
        has_new_problems = any(problem for problem in new_problems if problem not in old_problems)
        
        # Check for critical lab results
        old_labs = old_brief.get("key_labs", [])
        new_labs = new_brief.get("key_labs", [])
        has_critical_labs = any(
            lab for lab in new_labs 
            if lab not in old_labs and ("critical" in lab.lower() or "abnormal" in lab.lower())
        )
        
        return has_new_red_flags or has_new_problems or has_critical_labs
    
    async def _send_update_notification(self, referral_id: str, patient_id: str):
        """Send notification for significant record update"""
        self.logger.info(f"Sending update notification for referral {referral_id}")
        
        # In a real implementation, this would:
        # 1. Find the receiving physician
        # 2. Send email/SMS/push notification
        # 3. Update UI with notification badge
        # 4. Log the notification for tracking
        
        notification_data = {
            "referral_id": referral_id,
            "patient_id": patient_id,
            "type": "significant_update",
            "message": f"Updated medical summary available for referral {referral_id}",
            "timestamp": datetime.now().isoformat()
        }
        
        self.logger.info(f"Notification sent: {notification_data}")

# Agent server entry point
async def start_loop_agent():
    """Start the loop agent A2A server"""
    from adk.api_server import start_a2a_server
    
    loop_agent = LoopAgent()
    agent = loop_agent.build_agent()
    
    # Start A2A server
    await start_a2a_server(
        agent=agent,
        port=AGENT_PORTS["loop"],
        agent_card=loop_agent.get_agent_card()
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
    asyncio.run(start_loop_agent())
