import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase } from '@/lib/supabase'

export async function GET() {
  console.log('🔍 Debug user endpoint called')
  
  try {
    console.log('🔐 Getting Auth0 session...')
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'No Auth0 session found',
        timestamp: new Date().toISOString()
      })
    }

    console.log('👤 Auth0 user found:', {
      sub: session.user.sub,
      email: session.user.email,
      name: session.user.name
    })

    // Check if user exists in Supabase
    console.log('🔍 Checking Supabase for user...')
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    console.log('📊 Supabase query result:', {
      found: !!existingUser,
      user: existingUser,
      error: fetchError
    })

    // Also check by email
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)

    console.log('📧 Supabase email query result:', {
      found: !!userByEmail?.length,
      users: userByEmail,
      error: emailError
    })

    return NextResponse.json({
      success: true,
      auth0User: {
        sub: session.user.sub,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.email_verified
      },
      supabaseUser: existingUser,
      supabaseByEmail: userByEmail,
      errors: {
        fetchError,
        emailError
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('🚨 Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
