import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { specialty, chief_complaint, priority = 'routine' } = body

    // Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create new referral
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

    if (error) throw error

    return NextResponse.json({ referral }, { status: 201 })
  } catch (error) {
    console.error('Error creating referral:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
