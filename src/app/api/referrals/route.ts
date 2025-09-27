import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let referrals
    if (user.role === 'patient') {
      // Get referrals for this patient
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          doctor:doctor_id(name, email),
          referring_doctor:referring_doctor_id(name, email)
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      referrals = data
    } else if (user.role === 'doctor') {
      // Get referrals assigned to this doctor
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          patient:patient_id(name, email),
          referring_doctor:referring_doctor_id(name, email)
        `)
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      referrals = data
    }

    return NextResponse.json({ referrals })
  } catch (error) {
    console.error('Error fetching referrals:', error)
    
    // Better error serialization for debugging
    let errorDetails = 'Unknown error'
    if (error instanceof Error) {
      errorDetails = error.message
    } else if (typeof error === 'object' && error !== null) {
      errorDetails = JSON.stringify(error, null, 2)
    } else {
      errorDetails = String(error)
    }
    
    console.error('Serialized fetch error details:', errorDetails)
    
    return NextResponse.json({ 
      error: 'Failed to fetch referrals',
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/referrals called')
  
  try {
    console.log('🔐 Getting Auth0 session...')
    const session = await getSession()
    console.log('👤 Session:', session ? 'Found' : 'Not found')
    
    if (!session?.user) {
      console.log('❌ No user in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📥 Parsing request body...')
    const body = await request.json()
    const { specialty, chief_complaint, priority = 'routine' } = body
    console.log('📋 Referral data:', { specialty, chief_complaint, priority })

    // Get user from database
    console.log('🔍 Looking up user with Auth0 ID:', session.user.sub)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    console.log('👤 User lookup result:', user ? 'Found' : 'Not found')
    if (userError) console.log('❌ User lookup error:', userError)

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create new referral
    console.log('💾 Creating referral for user:', user.id)
    const { data: referral, error } = await supabase
      .from('referrals')
      .insert({
        patient_id: user.id,
        specialty,
        chief_complaint,
        priority,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.log('❌ Referral creation error:', error)
      throw error
    }

    console.log('✅ Referral created successfully:', referral)
    return NextResponse.json({ referral }, { status: 201 })
  } catch (error) {
    console.error('🚨 Error creating referral:', error)
    
    // Better error serialization for debugging
    let errorDetails = 'Unknown error'
    if (error instanceof Error) {
      errorDetails = error.message
    } else if (typeof error === 'object' && error !== null) {
      errorDetails = JSON.stringify(error, null, 2)
    } else {
      errorDetails = String(error)
    }
    
    console.error('🚨 Serialized referral error details:', errorDetails)
    
    return NextResponse.json({ 
      error: 'Failed to create referral',
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
