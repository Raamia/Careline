import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" - any other error is a real problem
      throw fetchError
    }

    if (existingUser) {
      return NextResponse.json({ 
        message: 'User already exists', 
        user: existingUser 
      })
    }

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        auth0_id: session.user.sub,
        email: session.user.email,
        name: session.user.name,
        role: 'patient' // Default role
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json({ 
      message: 'User created successfully', 
      user: newUser 
    })
  } catch (error) {
    console.error('User sync error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync user', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    )
  }
}
