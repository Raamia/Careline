# Gemini API Setup Guide

## 🚨 **Current Issue: Gemini API Not Working**

The Gemini API integration has been updated with better error handling and debugging. Follow these steps to fix the issues:

## 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key (starts with `AIza...`)

## 2. Set Environment Variable

Add to your `.env.local` file:
```bash
GEMINI_API_KEY=your_api_key_here
```

⚠️ **Important**: Make sure there are no spaces around the `=` sign.

## 3. Test Your Setup

### Option 1: Use Debug Endpoints
1. **Basic check**: Visit `https://careline.select/api/debug`
2. **Full Gemini test**: Visit `https://careline.select/api/gemini/debug`

### Option 2: Check Server Logs
Look for these messages in your server console:
- ✅ `Gemini response received`
- 🚨 `Gemini API key missing`
- ⚠️ `No valid JSON found in Gemini response`

## 4. Common Issues & Solutions

### ❌ **"API_KEY_INVALID"**
- Your API key is wrong or expired
- Generate a new key at [Google AI Studio](https://makersuite.google.com/app/apikey)

### ❌ **"PERMISSION_DENIED"** 
- Your API key doesn't have Generative AI permissions
- Ensure you're using the right Google account

### ❌ **"QUOTA_EXCEEDED"**
- You've hit your free tier limits
- Check your usage at [Google Cloud Console](https://console.cloud.google.com/)

### ❌ **"Model not found"**
- The code has been updated to use current Gemini 2.5 series models
- Make sure you're using the latest version

## 5. Model Updates

The integration now uses the latest Gemini 2.5 series:
- **`gemini-2.5-flash`**: Balanced performance for quick tasks (specialists, costs)
- **`gemini-2.5-pro`**: Advanced reasoning for complex tasks (document analysis, referrals)

## 6. Debugging Features

### Enhanced Logging
All Gemini functions now include detailed console logs:
```
🔍 Searching for specialists using Gemini AI...
✅ Gemini response received: {"specialists": [...]...
📋 Found 3 specialists
```

### Better Error Messages
Errors now include:
- Specific error types and messages
- Recommendations for fixing common issues
- Raw response data for debugging

## 7. Test the Integration

1. **Go to Dashboard**: Visit `https://careline.select/dashboard`
2. **Try AI Features**:
   - Document Analysis (sidebar)
   - Cost Intelligence (sidebar) 
   - Provider Search (sidebar)
   - AI Search on referrals

## 8. Verify It's Working

✅ **Success indicators**:
- No demo mode banner warnings about Gemini
- AI features return real responses (not error messages)
- Console shows `✅` success logs
- Debug endpoints show `"status": "success"`

❌ **Still not working?**:
- Check the console for detailed error messages
- Visit `/api/gemini/debug` for comprehensive testing
- Ensure your `.env.local` file is in the project root
- Restart your development server after adding the API key

## 9. Production Deployment

For Vercel deployment, add the environment variable:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add `GEMINI_API_KEY` with your API key
5. Redeploy your application

---

**Need help?** Check the console logs and debug endpoints for detailed error information.
