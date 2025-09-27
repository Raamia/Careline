# 🚀 Careline Integration Setup Guide

## 📋 Prerequisites
- Supabase account (free tier works)
- Google AI Studio account for Gemini API
- Your Auth0 configuration (already set up)

## 🔧 Step 1: Set Up Supabase

1. **Create a new Supabase project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Choose a region close to your users

2. **Run the database schema:**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the script to create all tables and policies

3. **Get your Supabase credentials:**
   - Go to Settings → API
   - Copy the Project URL and anon key

## 🤖 Step 2: Set Up Gemini AI

1. **Get a Gemini API key:**
   - Go to [https://ai.google.dev](https://ai.google.dev)
   - Create a new project or use an existing one
   - Enable the Generative AI API
   - Create an API key

## 🔐 Step 3: Environment Variables

Create/update your `.env.local` file with:

```bash
# Auth0 (you already have these)
AUTH0_SECRET=your_auth0_secret
AUTH0_BASE_URL=https://careline.select
AUTH0_ISSUER_BASE_URL=your_auth0_domain
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

## 📊 Step 4: Vercel Environment Variables

Add the same environment variables to your Vercel project:

1. Go to your Vercel dashboard
2. Select your Careline project
3. Go to Settings → Environment Variables
4. Add all the variables above

## 🧪 Step 5: Test the Integration

1. **Deploy the changes:**
   ```bash
   git add -A
   git commit -m "Add Supabase and Gemini integration"
   git push origin main
   ```

2. **Test the features:**
   - Login to your dashboard
   - Try switching between Patient/Doctor roles
   - Test the "Ask Gemini" buttons (they'll now work!)
   - Create a new referral
   - Use the AI-powered features

## 🔍 API Endpoints Available

- `GET /api/referrals` - Get user's referrals
- `POST /api/referrals` - Create new referral
- `POST /api/users/sync` - Sync Auth0 user to Supabase
- `POST /api/gemini/specialists` - Find specialists with AI
- `POST /api/gemini/costs` - Explain costs with AI
- `POST /api/gemini/summarize` - Summarize medical records
- `POST /api/gemini/referral` - Generate referral packets

## 📈 Database Tables Created

- **users** - Patient and doctor profiles
- **referrals** - Referral requests and tracking
- **medical_records** - Patient documents and AI summaries
- **specialists** - Directory of healthcare providers
- **messages** - Communication between users

## 🔒 Security Features

- Row Level Security (RLS) enabled
- Users can only see their own data
- Doctors can only see assigned patient data
- All API routes require authentication

## 🎯 Next Steps

Once everything is set up, you can:

1. **Test real AI features:** The "Ask Gemini" buttons will work
2. **Add real data:** Create referrals and see them persist
3. **Upload documents:** (requires file upload integration)
4. **Customize AI prompts:** Modify `/lib/gemini.ts` for specific use cases

## 🐛 Troubleshooting

**Build errors:**
- Make sure all environment variables are set in Vercel
- Check the API keys are valid

**Database errors:**
- Verify the schema was applied correctly in Supabase
- Check RLS policies are enabled

**Gemini API errors:**
- Ensure your API key has quota remaining
- Check the API is enabled in Google Cloud Console

---

🎉 **Your Careline platform is now fully integrated with AI and database capabilities!**
