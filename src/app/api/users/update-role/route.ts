import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('🔄 POST /api/users/update-role called')
  
  try {
    console.log('🔐 Getting Auth0 session...')
    const session = await getSession()
    console.log('👤 Session:', session ? 'Found' : 'Not found')
    
    if (!session?.user) {
      console.log('❌ No user in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()
    console.log('👤 Requested role update to:', role)

    if (!role || !['patient', 'doctor'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update user role in database
    console.log('💾 Updating user role in database...')
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ role })
      .eq('auth0_id', session.user.sub)
      .select()
      .single()

    if (error) {
      console.error('❌ Database update error:', error)
      throw error
    }

    console.log('✅ User role updated successfully:', updatedUser)
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('🚨 Error updating user role:', error)
    
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
        error: 'Failed to update user role',
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
