import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔄 POST /api/users/sync called')
  
  try {
    console.log('🔐 Getting Auth0 session...')
    const session = await getSession()
    console.log('👤 Session:', session ? 'Found' : 'Not found')
    console.log('🆔 Auth0 ID:', session?.user?.sub)
    
    if (!session?.user) {
      console.log('❌ No user in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role = 'patient' } = await request.json()
    console.log('👤 Requested role:', role)

    // Check if user already exists
    console.log('🔍 Checking if user exists in database...')
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    console.log('👤 Existing user:', existingUser ? 'Found' : 'Not found')
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.log('❌ Database fetch error:', fetchError)
    }

    if (existingUser) {
      console.log('✅ Returning existing user:', existingUser.id)
      return NextResponse.json({ user: existingUser })
    }

    // Create new user in Supabase
    console.log('💾 Creating new user in database...')
    const userData = {
      auth0_id: session.user.sub,
      email: session.user.email,
      name: session.user.name,
      role: role
    }
    console.log('📋 User data to insert:', userData)
    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      throw error
    }

    console.log('✅ User created successfully:', newUser)
    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('🚨 Error syncing user:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync user',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
