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

    const body = await request.json()
    const { role = 'patient' } = body || {}
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
      console.log('✅ Existing user found:', existingUser.id)
      
      // Always return existing user as-is (don't override role)
      console.log('👤 User role in database:', existingUser.role);
      
      return NextResponse.json({ user: existingUser })
    }

    // Create new user in Supabase
    console.log('💾 Creating new user in database...')
    
    // Auto-assign doctor role for specific provider email
    let assignedRole = role;
    if (session.user.email === 'raamiabichou@gmail.com') {
      assignedRole = 'doctor';
      console.log('🏥 Auto-assigning doctor role for provider email');
    }
    
    const userData = {
      auth0_id: session.user.sub,
      email: session.user.email,
      name: session.user.name,
      role: assignedRole
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
    
    // Better error serialization for debugging
    let errorDetails = 'Unknown error'
    if (error instanceof Error) {
      errorDetails = error.message
    } else if (typeof error === 'object' && error !== null) {
      errorDetails = JSON.stringify(error, null, 2)
    } else {
      errorDetails = String(error)
    }
    
    console.error('🚨 Serialized error details:', errorDetails)
    
    return NextResponse.json(
      { 
        error: 'Failed to sync user',
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
