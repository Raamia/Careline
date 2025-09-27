import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasAuth0Secret: !!process.env.AUTH0_SECRET,
      hasAuth0BaseUrl: !!process.env.AUTH0_BASE_URL,
      hasAuth0IssuerUrl: !!process.env.AUTH0_ISSUER_BASE_URL,
      hasAuth0ClientId: !!process.env.AUTH0_CLIENT_ID,
      hasAuth0ClientSecret: !!process.env.AUTH0_CLIENT_SECRET,
    }

    // Check Auth0 session
    let sessionCheck = null
    try {
      const session = await getSession()
      sessionCheck = {
        hasSession: !!session,
        hasUser: !!session?.user,
        userSub: session?.user?.sub || null,
        userEmail: session?.user?.email || null
      }
    } catch (error) {
      sessionCheck = { error: 'Failed to get session', details: error instanceof Error ? error.message : String(error) }
    }

    // Check Supabase connection
    let supabaseCheck = null
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase.from('users').select('count').limit(1)
      supabaseCheck = {
        connected: !error,
        error: error?.message || null,
        canQuery: !!data
      }
    } catch (error) {
      supabaseCheck = { error: 'Failed to import/connect', details: error instanceof Error ? error.message : String(error) }
    }

    // Check Gemini API (basic check only)
    let geminiCheck = null
    try {
      if (process.env.GEMINI_API_KEY) {
        geminiCheck = {
          hasApiKey: true,
          keyLength: process.env.GEMINI_API_KEY.length,
          status: 'Ready for testing (use /api/gemini/debug for full test)'
        }
      } else {
        geminiCheck = {
          hasApiKey: false,
          status: 'API key not configured'
        }
      }
    } catch (error) {
      geminiCheck = { error: 'Failed to check Gemini setup', details: error instanceof Error ? error.message : String(error) }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      session: sessionCheck,
      supabase: supabaseCheck,
      gemini: geminiCheck
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    )
  }
}
