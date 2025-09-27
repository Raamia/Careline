#!/bin/bash

# CareLine.select One-Command Setup
# This script sets up the entire CareLine system for production deployment

set -e

echo "🚀 Setting up CareLine for careline.select domain..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the CareLine root directory"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install --legacy-peer-deps

# Install Python dependencies for ADK agents
echo "🐍 Installing Python dependencies..."
cd adk-agents
pip3 install -r requirements.txt
cd ..

# Generate agent cards
echo "🎴 Generating agent cards..."
cd adk-agents
python3 configs/agent_cards.py
cd ..

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

# Create environment file reminders
echo ""
echo "⚠️  IMPORTANT: Set up your environment variables!"
echo ""
echo "📋 Required steps:"
echo "1. Copy credentials to .env.local (see careline-select-config.md)"
echo "2. Set up Auth0 with callback URL: https://careline.select/api/auth/callback"
echo "3. Create Firebase project and get service account JSON"
echo "4. Get Gemini API key from https://aistudio.google.com/app/apikey"
echo ""

# Check if environment is set up
if [ ! -f ".env.local" ]; then
    echo "📄 Creating .env.local template..."
    cat > .env.local << 'EOF'
# CareLine Production Environment
# Domain: careline.select

# Auth0 Configuration (REQUIRED)
AUTH0_SECRET=generate-with-openssl-rand-hex-32
AUTH0_BASE_URL=https://careline.select
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# Firebase Configuration (REQUIRED)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-service-account-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key

# Google Gemini API (REQUIRED)
GEMINI_API_KEY=your-gemini-api-key
EOF
    echo "✅ Created .env.local template - please fill in your credentials"
else
    echo "✅ .env.local already exists"
fi

# Check if ADK environment is set up
if [ ! -f "adk-agents/.env" ]; then
    echo "📄 Creating ADK .env template..."
    cat > adk-agents/.env << 'EOF'
# CareLine ADK Production Environment
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-service-account-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
A2A_BASE_URL=https://careline.select
ORCHESTRATOR_PORT=8000
DIRECTORY_PORT=8001
AVAILABILITY_PORT=8002
COST_PORT=8003
RECORDS_PORT=8004
SUMMARIZER_PORT=8005
LOOP_PORT=8006
LOG_LEVEL=INFO
EOF
    echo "✅ Created ADK .env template - please fill in your credentials"
else
    echo "✅ ADK .env already exists"
fi

# Make deployment script executable
chmod +x deploy-production.sh

echo ""
echo "🎉 CareLine setup complete!"
echo ""
echo "🚀 Next steps to deploy to careline.select:"
echo "1. Fill in your credentials in .env.local and adk-agents/.env"
echo "2. Run: ./deploy-production.sh"
echo "3. Add custom domain: vercel domains add careline.select"
echo ""
echo "📚 See careline-select-config.md for detailed instructions"
echo "=================================================="
