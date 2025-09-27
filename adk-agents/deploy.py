#!/usr/bin/env python3
"""
CareLine ADK Deployment Script

This script deploys all CareLine agents as separate A2A services.
Each agent runs on its own port and can communicate via the A2A protocol.
"""

import asyncio
import signal
import sys
import logging
import multiprocessing
from typing import List, Dict, Any
import subprocess
import time
import os

from config import AGENT_PORTS, LOGGING_CONFIG

# Configure logging
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)

class AgentDeployment:
    """Manages deployment of all CareLine agents"""
    
    def __init__(self):
        self.processes: Dict[str, subprocess.Popen] = {}
        self.running = False
        
    def start_all_agents(self):
        """Start all agents as separate processes"""
        logger.info("Starting CareLine ADK agent deployment...")
        
        agents = [
            "orchestrator",
            "directory", 
            "availability",
            "cost",
            "records",
            "summarizer",
            "loop"
        ]
        
        for agent_name in agents:
            self.start_agent(agent_name)
            time.sleep(2)  # Stagger startup to avoid port conflicts
        
        self.running = True
        logger.info(f"All {len(agents)} agents started successfully")
        
        # Print agent URLs
        print("\n" + "="*60)
        print("🚀 CareLine ADK Agents Deployed Successfully!")
        print("="*60)
        for agent_name in agents:
            port = AGENT_PORTS[agent_name]
            print(f"📍 {agent_name.title()} Agent: http://localhost:{port}/a2a/{agent_name.title()}Agent")
        print("="*60)
        print("💡 Use Ctrl+C to stop all agents")
        print("="*60 + "\n")
    
    def start_agent(self, agent_name: str):
        """Start a single agent process"""
        try:
            port = AGENT_PORTS[agent_name]
            script_path = f"agents/{agent_name}_agent.py"
            
            logger.info(f"Starting {agent_name} agent on port {port}")
            
            # Start agent process
            process = subprocess.Popen([
                sys.executable, script_path
            ], cwd=os.path.dirname(os.path.abspath(__file__)))
            
            self.processes[agent_name] = process
            logger.info(f"✅ {agent_name} agent started (PID: {process.pid})")
            
        except Exception as e:
            logger.error(f"❌ Failed to start {agent_name} agent: {e}")
            raise
    
    def stop_all_agents(self):
        """Stop all agent processes"""
        logger.info("Stopping all agents...")
        
        for agent_name, process in self.processes.items():
            try:
                logger.info(f"Stopping {agent_name} agent...")
                process.terminate()
                
                # Wait for graceful shutdown
                try:
                    process.wait(timeout=5)
                    logger.info(f"✅ {agent_name} agent stopped gracefully")
                except subprocess.TimeoutExpired:
                    logger.warning(f"⚠️  Force killing {agent_name} agent")
                    process.kill()
                    process.wait()
                    
            except Exception as e:
                logger.error(f"Error stopping {agent_name} agent: {e}")
        
        self.processes.clear()
        self.running = False
        logger.info("All agents stopped")
    
    def check_agent_health(self) -> Dict[str, bool]:
        """Check health of all agents"""
        health_status = {}
        
        for agent_name, process in self.processes.items():
            if process.poll() is None:  # Process is running
                health_status[agent_name] = True
            else:
                health_status[agent_name] = False
                logger.error(f"❌ {agent_name} agent has stopped unexpectedly")
        
        return health_status
    
    def restart_failed_agents(self):
        """Restart any failed agents"""
        health_status = self.check_agent_health()
        
        for agent_name, is_healthy in health_status.items():
            if not is_healthy:
                logger.info(f"Restarting failed {agent_name} agent...")
                try:
                    # Clean up old process
                    if agent_name in self.processes:
                        del self.processes[agent_name]
                    
                    # Start new process
                    self.start_agent(agent_name)
                    logger.info(f"✅ {agent_name} agent restarted")
                    
                except Exception as e:
                    logger.error(f"Failed to restart {agent_name} agent: {e}")

async def monitor_agents(deployment: AgentDeployment):
    """Monitor agent health and restart failed agents"""
    while deployment.running:
        try:
            await asyncio.sleep(30)  # Check every 30 seconds
            deployment.restart_failed_agents()
        except Exception as e:
            logger.error(f"Error in agent monitoring: {e}")

def signal_handler(signum, frame, deployment: AgentDeployment):
    """Handle shutdown signals"""
    logger.info(f"Received signal {signum}, shutting down...")
    deployment.stop_all_agents()
    sys.exit(0)

def main():
    """Main deployment function"""
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Create deployment manager
    deployment = AgentDeployment()
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, lambda s, f: signal_handler(s, f, deployment))
    signal.signal(signal.SIGTERM, lambda s, f: signal_handler(s, f, deployment))
    
    try:
        # Start all agents
        deployment.start_all_agents()
        
        # Start monitoring
        asyncio.run(monitor_agents(deployment))
        
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    except Exception as e:
        logger.error(f"Deployment error: {e}")
    finally:
        deployment.stop_all_agents()

if __name__ == "__main__":
    main()
