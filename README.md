# CareLine - Intelligent Medical Referrals

CareLine is a multi-agent AI web application that streamlines medical referrals by connecting patients with specialists through intelligent matching, transparent pricing, and AI-generated clinical summaries.

## 🏗️ Architecture

### Core Components

- **Patient Portal**: View referrals, select specialists, see costs and availability
- **Doctor Portal**: Receive referrals with AI-generated clinical briefs
- **Multi-Agent System**: 7 specialized AI agents handle the workflow

### Agent System

1. **Orchestrator Agent**: Coordinates all other agents
2. **Directory Agent**: Finds specialists using mock NPI data
3. **Availability Agent**: Returns appointment slots
4. **Cost Agent**: Estimates out-of-pocket costs
5. **Records Agent**: Parses medical records to FHIR-lite format
6. **Summarizer Agent**: Generates clinical briefs and patient explainers using Gemini
7. **Loop Agent**: Handles continuous updates when records change

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase project
- Auth0 account
- Google Gemini API key

### Environment Setup

1. Copy the environment example:
```bash
cp env.example .env.local
```

2. Configure your environment variables:

```bash
# Auth0 Configuration
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-auth0-domain.auth0.com'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'

# Firebase Configuration
FIREBASE_PROJECT_ID='your-firebase-project-id'
FIREBASE_CLIENT_EMAIL='your-firebase-client-email'
FIREBASE_PRIVATE_KEY='your-firebase-private-key'

# Google Gemini API
GEMINI_API_KEY='your-gemini-api-key'
```

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔄 How It Works

### Patient Flow

1. **Login** → Secure authentication with role-based access
2. **Referral Card** → See referrals instantly with clear explanations
3. **Decision Card** → Browse in-network providers with:
   - Cost estimates
   - Earliest available slots
   - Provider ratings and distance
4. **Book Appointment** → Click to send referral to chosen specialist
5. **Patient Explainer** → Get plain-English explanations of your condition

### Doctor Flow

1. **Login** → Secure authentication for medical professionals
2. **Incoming Referrals** → See new referrals with urgency flags
3. **AI Clinical Brief** → Get structured summaries including:
   - Problem list
   - Current medications
   - Allergies
   - Key lab results
   - Red flags
   - Clinical recommendations
4. **Accept/Request More Info** → Streamlined referral management

## 🤖 Agent Workflow

When a referral is created:

1. **Orchestrator** fans out tasks to other agents
2. **Directory** + **Records** agents run in parallel
3. **Availability** + **Cost** + **Summarizer** agents run after directory completes
4. **Loop** agent monitors for record updates and re-triggers summarizer

All agents write results to Firestore and update task status for tracking.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Auth0
- **AI**: Google Gemini for medical summaries
- **State Management**: TanStack Query
- **UI Components**: Radix UI, Lucide React

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 app router
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard pages
│   └── page.tsx          # Landing page
├── agents/                # AI agent implementations
│   ├── orchestrator/     # Coordinates other agents
│   ├── directory/        # Provider lookup
│   ├── availability/     # Appointment slots
│   ├── cost/            # Price estimation
│   ├── records/         # Medical record parsing
│   ├── summarizer/      # Gemini AI summaries
│   └── loop/            # Continuous updates
├── components/            # React components
│   ├── ui/              # Reusable UI components
│   ├── patient/         # Patient portal components
│   └── doctor/          # Doctor portal components
├── lib/                  # Utility libraries
│   ├── database.ts      # Firestore service classes
│   ├── firebase.ts      # Firebase client config
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
```

## 🔒 Security Features

- **Auth0 Integration**: Secure authentication with role-based access
- **Firebase Security Rules**: Database-level security
- **API Route Protection**: Server-side authentication checks
- **HIPAA Considerations**: Encrypted data storage and transmission

## 🧪 Testing

The application includes comprehensive mock data for testing:

- Sample patients with medical histories
- Mock provider networks
- Simulated insurance verification
- AI-generated clinical summaries

## 🚀 Deployment

### Production Setup

1. Set up Firebase project with Firestore
2. Configure Auth0 application
3. Get Google Gemini API key
4. Deploy to Vercel or similar platform

### Environment Variables for Production

```bash
AUTH0_BASE_URL='https://your-domain.com'
# ... other production URLs
```

## 🔮 Future Enhancements

- **Real Integrations**: Connect to actual EHR systems, provider APIs
- **Advanced AI**: Enhanced medical NLP, drug interaction checking
- **Mobile App**: React Native companion app
- **Telehealth**: Video consultation integration
- **Analytics**: Provider performance metrics
- **ML Pipeline**: Continuous model improvement

## 📋 API Endpoints

- `POST /api/referrals` - Create new referral
- `GET /api/referrals` - Get referrals (by patient/doctor)
- `POST /api/agents/orchestrator` - Trigger agent workflow
- `GET /api/decision-cards` - Get provider options
- `POST /api/appointments` - Book appointment
- `DELETE /api/appointments` - Cancel appointment

## 🎯 Production Considerations

**Note**: This application includes all components in a single Next.js project for development convenience. In production, consider:

- Separating agents into microservices
- Using message queues (Pub/Sub) for agent communication
- Implementing proper error handling and retry logic
- Adding comprehensive logging and monitoring
- Setting up CI/CD pipelines
- Implementing backup and disaster recovery

## 📜 License

This project is for demonstration purposes. Ensure compliance with HIPAA and other medical data regulations before production use.
