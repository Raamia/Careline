#!/usr/bin/env python3
"""
CareLine ADK Agent Testing Script

This script tests the A2A communication between CareLine agents.
It simulates a complete referral workflow to verify all agents work together.
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime
from typing import Dict, Any

from config import AGENT_PORTS, get_agent_url

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentTester:
    """Test suite for CareLine ADK agents"""
    
    def __init__(self):
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def send_agent_message(self, agent_name: str, action: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Send a message to an agent via HTTP"""
        try:
            url = f"{get_agent_url(agent_name)}/{action}"
            
            async with self.session.post(url, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"✅ {agent_name} {action}: Success")
                    return result
                else:
                    error_text = await response.text()
                    logger.error(f"❌ {agent_name} {action}: HTTP {response.status} - {error_text}")
                    return {"success": False, "error": f"HTTP {response.status}"}
                    
        except Exception as e:
            logger.error(f"❌ {agent_name} {action}: {e}")
            return {"success": False, "error": str(e)}
    
    async def test_agent_health(self, agent_name: str) -> bool:
        """Test if an agent is healthy and responding"""
        try:
            port = AGENT_PORTS[agent_name]
            url = f"http://localhost:{port}/health"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    logger.info(f"✅ {agent_name} agent is healthy")
                    return True
                else:
                    logger.error(f"❌ {agent_name} agent health check failed: HTTP {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ {agent_name} agent health check failed: {e}")
            return False
    
    async def test_all_agent_health(self) -> Dict[str, bool]:
        """Test health of all agents"""
        logger.info("🔍 Testing agent health...")
        
        agents = ["orchestrator", "directory", "availability", "cost", "records", "summarizer", "loop"]
        health_results = {}
        
        for agent_name in agents:
            health_results[agent_name] = await self.test_agent_health(agent_name)
        
        healthy_count = sum(health_results.values())
        logger.info(f"📊 Agent Health: {healthy_count}/{len(agents)} agents healthy")
        
        return health_results
    
    async def test_directory_agent(self) -> Dict[str, Any]:
        """Test the directory agent"""
        logger.info("🔍 Testing Directory Agent...")
        
        test_data = {
            "referral_id": "test-ref-001",
            "specialty": "Cardiology", 
            "patient_id": "test-patient-001"
        }
        
        result = await self.send_agent_message("directory", "find_providers", test_data)
        
        if result.get("success"):
            providers = result.get("data", {}).get("providers", [])
            logger.info(f"📋 Found {len(providers)} cardiology providers")
            
            if providers:
                logger.info(f"   First provider: {providers[0].get('name', 'Unknown')}")
        
        return result
    
    async def test_orchestrator_workflow(self) -> Dict[str, Any]:
        """Test the complete orchestrator workflow"""
        logger.info("🚀 Testing Orchestrator Workflow...")
        
        test_event = {
            "type": "referral.created",
            "referral_id": "test-ref-workflow-001",
            "patient_id": "test-patient-workflow-001", 
            "specialty": "Cardiology",
            "timestamp": datetime.now().isoformat(),
            "referral": {
                "id": "test-ref-workflow-001",
                "patient_id": "test-patient-workflow-001",
                "specialty": "Cardiology",
                "reason": "Chest pain and shortness of breath",
                "urgency": "urgent"
            }
        }
        
        result = await self.send_agent_message("orchestrator", "process_referral_created", test_event)
        
        if result.get("success"):
            decision_card = result.get("data", {}).get("decision_card", {})
            logger.info("🎯 Workflow completed successfully!")
            logger.info(f"   Providers found: {len(decision_card.get('providers', []))}")
            logger.info(f"   Availability slots: {len(decision_card.get('availability', []))}")
            logger.info(f"   Cost estimates: {len(decision_card.get('cost_estimates', []))}")
            
            if decision_card.get("patient_explainer"):
                logger.info("   Patient explainer: Generated")
            
        return result
    
    async def test_loop_agent_monitoring(self) -> Dict[str, Any]:
        """Test the loop agent monitoring functionality"""
        logger.info("🔄 Testing Loop Agent Monitoring...")
        
        # Start monitoring
        start_data = {
            "patient_id": "test-patient-monitoring-001",
            "referral_id": "test-ref-monitoring-001"
        }
        
        start_result = await self.send_agent_message("loop", "start_monitoring", start_data)
        
        if start_result.get("success"):
            logger.info("📡 Monitoring started successfully")
            
            # Simulate a records update
            await asyncio.sleep(1)  # Brief pause
            
            update_data = {
                "type": "records.updated",
                "patient_id": "test-patient-monitoring-001",
                "referral_id": "test-ref-monitoring-001",
                "timestamp": datetime.now().isoformat()
            }
            
            update_result = await self.send_agent_message("loop", "process_records_updated", update_data)
            
            if update_result.get("success"):
                logger.info("🔄 Records update processed successfully")
            
            return update_result
        
        return start_result
    
    async def run_complete_test_suite(self):
        """Run the complete test suite"""
        logger.info("🧪 Starting CareLine ADK Agent Test Suite")
        logger.info("=" * 60)
        
        # Test 1: Agent Health
        health_results = await self.test_all_agent_health()
        
        if not all(health_results.values()):
            logger.error("⚠️  Some agents are not healthy. Please check deployment.")
            return False
        
        print()
        
        # Test 2: Directory Agent
        directory_result = await self.test_directory_agent()
        print()
        
        # Test 3: Orchestrator Workflow  
        workflow_result = await self.test_orchestrator_workflow()
        print()
        
        # Test 4: Loop Agent Monitoring
        monitoring_result = await self.test_loop_agent_monitoring()
        print()
        
        # Test Results Summary
        logger.info("📊 Test Results Summary")
        logger.info("=" * 60)
        
        tests_passed = 0
        total_tests = 4
        
        if all(health_results.values()):
            logger.info("✅ Agent Health: PASSED")
            tests_passed += 1
        else:
            logger.info("❌ Agent Health: FAILED")
        
        if directory_result.get("success"):
            logger.info("✅ Directory Agent: PASSED")
            tests_passed += 1
        else:
            logger.info("❌ Directory Agent: FAILED")
        
        if workflow_result.get("success"):
            logger.info("✅ Orchestrator Workflow: PASSED")
            tests_passed += 1
        else:
            logger.info("❌ Orchestrator Workflow: FAILED")
        
        if monitoring_result.get("success"):
            logger.info("✅ Loop Agent Monitoring: PASSED")
            tests_passed += 1
        else:
            logger.info("❌ Loop Agent Monitoring: FAILED")
        
        logger.info("=" * 60)
        logger.info(f"🎯 Overall Result: {tests_passed}/{total_tests} tests passed")
        
        if tests_passed == total_tests:
            logger.info("🎉 All tests PASSED! CareLine ADK agents are working correctly.")
            return True
        else:
            logger.info("⚠️  Some tests FAILED. Please check agent logs for details.")
            return False

async def main():
    """Main test function"""
    async with AgentTester() as tester:
        success = await tester.run_complete_test_suite()
        return success

if __name__ == "__main__":
    import sys
    
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logger.info("Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Test failed with error: {e}")
        sys.exit(1)
