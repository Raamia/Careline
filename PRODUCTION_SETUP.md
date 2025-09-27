# 🚀 CareLine Production Deployment Guide

This guide sets up CareLine for **immediate production deployment** with auto-deployment on every commit.

## 🔑 **Step 1: Get Your Credentials**

### **Firebase Setup**
1. Go to https://console.firebase.google.com/
2. Create project: `careline-prod`
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Click "Generate New Private Key"
6. Download JSON and extract:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----
   ```

### **Google Gemini API**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key:
   ```
   GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### **Auth0 Setup**
1. Go to https://manage.auth0.com/
2. Create Application → Single Page Application
3. Set Allowed Callback URLs: `https://careline.select/api/auth/callback`
4. Set Allowed Logout URLs: `https://careline.select`
5. Copy credentials:
   ```
   AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   ```

### **Generate Auth0 Secret**
```bash
openssl rand -hex 32
# Copy output as AUTH0_SECRET
```

## 🌐 **Step 2: Deploy to Vercel**

### **Install Vercel CLI**
```bash
npm install -g vercel
```

### **Connect to Vercel**
```bash
vercel login
cd /path/to/careline
vercel
```

### **Set Environment Variables**
```bash
# Set production environment variables
vercel env add AUTH0_SECRET production
vercel env add AUTH0_BASE_URL production
vercel env add AUTH0_ISSUER_BASE_URL production
vercel env add AUTH0_CLIENT_ID production
vercel env add AUTH0_CLIENT_SECRET production
vercel env add FIREBASE_PROJECT_ID production
vercel env add FIREBASE_CLIENT_EMAIL production
vercel env add FIREBASE_PRIVATE_KEY production
vercel env add GEMINI_API_KEY production
```

### **Your Production URLs**
After deployment, your system will be available at:
- **Next.js App**: https://careline.select
- **Orchestrator Agent**: https://careline.select/a2a/orchestrator
- **Directory Agent**: https://careline.select/a2a/directory
- **All 7 Agents**: Ports 8000-8006 via Vercel functions

## 🔄 **Step 3: Auto-Deployment Setup**

### **GitHub Secrets**
Go to your GitHub repo → Settings → Secrets and add:

```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id  
VERCEL_PROJECT_ID=your-project-id

# Auth0
AUTH0_SECRET=your-generated-secret
AUTH0_BASE_URL=https://careline.select
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key

# Google AI
GEMINI_API_KEY=your-gemini-key
```

### **Auto-Deploy on Commit**
Every push to `main` will automatically:
1. ✅ Run tests
2. ✅ Build Next.js app
3. ✅ Test ADK agents
4. ✅ Deploy to production
5. ✅ Update all 7 agents

## 🤖 **Step 4: ADK/A2A Setup**

### **Google ADK Early Access**
⚠️ **Note**: Google ADK is currently in private beta.

**Option A: Apply for Access**
```bash
# Contact Google Cloud for ADK early access
# The code is ready when you get approved
```

**Option B: Use Mock Implementation**
```bash
# The current code works with mock A2A
# Ready to swap in real ADK when available
```

## 🎯 **Step 5: Production Environment**

### **Update Production URLs**
Edit `adk-agents/.env` for production:
```bash
# Production A2A Configuration
A2A_BASE_URL=https://careline.select
ORCHESTRATOR_PORT=8000
DIRECTORY_PORT=8001
# ... other ports

# Production logging
LOG_LEVEL=INFO
```

### **Custom Domain (Optional)**
```bash
# Add custom domain in Vercel dashboard
# Update AUTH0_BASE_URL to your domain
# Update A2A_BASE_URL to your domain
```

## 🚀 **Step 6: Deploy & Test**

### **Deploy**
```bash
git add .
git commit -m "feat: production deployment"
git push origin main
# Auto-deploys via GitHub Actions
```

### **Test Production**
```bash
# Test the live system
curl https://careline.select/api/health

# Test orchestrator
curl -X POST https://careline.select/a2a/orchestrator/process_referral_created \
  -H "Content-Type: application/json" \
  -d '{"referral_id": "prod-001", "patient_id": "patient-001", "specialty": "Cardiology"}'
```

## 📊 **Step 7: Monitoring**

### **Vercel Analytics**
- Automatic performance monitoring
- Error tracking
- Real-time logs

### **Firebase Monitoring**
- Database usage
- API call metrics
- Security rules monitoring

### **Custom Health Checks**
```bash
# Set up uptime monitoring
https://careline.select/api/health
https://careline.select/a2a/orchestrator/health
```

## 🎉 **Production Ready!**

Your CareLine system is now:
- ✅ **Auto-deploying** on every commit
- ✅ **Production-scaled** with Vercel
- ✅ **Monitored** with real-time analytics
- ✅ **Secure** with Auth0 + Firebase
- ✅ **AI-powered** with Gemini
- ✅ **Competition-ready** with ADK architecture

**Live URLs:**
- 🌐 **Patient Portal**: https://careline.select
- 🤖 **Agent System**: https://careline.select/a2a/*
- 📊 **Admin Dashboard**: https://careline.select/dashboard

Every code change automatically deploys to production! 🚀
