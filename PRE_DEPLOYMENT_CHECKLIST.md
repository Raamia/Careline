# 🚀 Pre-Deployment Checklist for CareLine

Before pushing to GitHub, complete these steps:

## ✅ **Environment Setup** 

### **1. Generate Auth0 Secret**
```bash
openssl rand -hex 32
# Save this value
```

### **2. Get Gemini API Key**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with AIzaSy...)

### **3. Set up Auth0**
1. Go to https://manage.auth0.com/
2. Create Application → Single Page Application
3. Set Allowed Callback URLs: `https://careline.select/api/auth/callback`
4. Set Allowed Logout URLs: `https://careline.select`
5. Copy your domain, client ID, and client secret

## ✅ **Vercel Configuration**

### **Install Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel link
```

### **Set Environment Variables**
```bash
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

**Values to use:**
- `AUTH0_SECRET`: Your generated secret
- `AUTH0_BASE_URL`: `https://careline.select`
- `AUTH0_ISSUER_BASE_URL`: `https://your-auth0-domain.auth0.com`
- `AUTH0_CLIENT_ID`: From Auth0 dashboard
- `AUTH0_CLIENT_SECRET`: From Auth0 dashboard
- `FIREBASE_PROJECT_ID`: `myclerk-473316`
- `FIREBASE_CLIENT_EMAIL`: `firebase-adminsdk-fbsvc@myclerk-473316.iam.gserviceaccount.com`
- `FIREBASE_PRIVATE_KEY`: Full private key from JSON
- `GEMINI_API_KEY`: Your Gemini API key

## ✅ **GitHub Secrets (For Auto-Deploy)**

Go to GitHub repo → Settings → Secrets → Actions:

### **Vercel Secrets**
```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id  
VERCEL_PROJECT_ID=your-vercel-project-id
```

### **Application Secrets**
```bash
AUTH0_SECRET=your-generated-secret
AUTH0_BASE_URL=https://careline.select
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
FIREBASE_PROJECT_ID=myclerk-473316
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@myclerk-473316.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your-full-private-key
GEMINI_API_KEY=your-gemini-key
```

## ✅ **Final Steps**

### **1. Test Local Build**
```bash
npm run build
```

### **2. Commit and Push**
```bash
git add .
git commit -m "feat: production deployment ready"
git push origin main
```

### **3. Add Custom Domain**
```bash
vercel domains add careline.select
```

### **4. Test Production**
```bash
curl https://careline.select/api/health
```

## 🎯 **After Deployment**

Your CareLine system will be live at:
- **🌐 Patient Portal**: https://careline.select
- **👨‍⚕️ Doctor Portal**: https://careline.select/dashboard
- **🤖 All 7 Agents**: https://careline.select/a2a/*

Every commit to main will auto-deploy! 🚀
