#!/bin/bash

# CareLine ADK Setup Script
# This script sets up the ADK environment and deploys all agents

set -e

echo "🚀 Setting up CareLine ADK Implementation..."
echo "================================================"

# Check Python version
echo "🐍 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.8"

if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"; then
    echo "❌ Python 3.8+ required. Found: $(python3 --version)"
    exit 1
fi
echo "✅ Python version: $(python3 --version)"

# Install dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "🔧 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your API keys before running agents"
else
    echo "✅ Environment file already exists"
fi

# Generate agent cards
echo ""
echo "🎴 Generating agent cards..."
python3 configs/agent_cards.py

# Check if required environment variables are set
echo ""
echo "🔍 Checking environment variables..."
source .env 2>/dev/null || true

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your-gemini-api-key" ]; then
    echo "⚠️  GEMINI_API_KEY not set. Please update .env file."
    echo "   Get your key from: https://aistudio.google.com/app/apikey"
else
    echo "✅ GEMINI_API_KEY is configured"
fi

# Make scripts executable
echo ""
echo "🔨 Making scripts executable..."
chmod +x deploy.py
chmod +x test_agents.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your API keys"
echo "2. Run: python3 deploy.py    (start all agents)"
echo "3. Run: python3 test_agents.py (test the system)"
echo ""
echo "🎯 Competition ready! All agents use Google ADK + A2A protocol"
echo "================================================"
