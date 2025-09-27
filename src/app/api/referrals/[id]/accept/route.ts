import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🏥 POST /api/referrals/[id]/accept called')
  
  try {
    console.log('🔐 Getting Auth0 session...')
    const session = await getSession()
    console.log('👤 Session:', session ? 'Found' : 'Not found')
    
    if (!session?.user) {
      console.log('❌ No user in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: referralId } = await params
    console.log('📋 Referral ID:', referralId)

    // Get doctor from database
    console.log('🔍 Looking up doctor with Auth0 ID:', session.user.sub)
    const { data: doctor, error: doctorError } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .eq('role', 'doctor')
      .single()

    console.log('👨‍⚕️ Doctor lookup result:', doctor ? 'Found' : 'Not found')
    if (doctorError) console.log('❌ Doctor lookup error:', doctorError)

    if (!doctor) {
      console.log('❌ Doctor not found or not authorized')
      return NextResponse.json({ error: 'Doctor not found or unauthorized' }, { status: 403 })
    }

    // Check if referral exists and is pending
    console.log('🔍 Looking up referral...')
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', referralId)
      .single()

    if (referralError || !referral) {
      console.log('❌ Referral not found:', referralError)
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }

    console.log('📋 Referral status:', referral.status)
    console.log('👨‍⚕️ Referral doctor_id:', referral.doctor_id)

    if (referral.status !== 'pending' || referral.doctor_id !== null) {
      console.log('❌ Referral already accepted or not available')
      return NextResponse.json({ error: 'Referral already accepted or not available' }, { status: 400 })
    }

    // Accept the referral by assigning doctor and updating status
    console.log('✅ Accepting referral...')
    const { data: updatedReferral, error: updateError } = await supabase
      .from('referrals')
      .update({
        doctor_id: doctor.id,
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', referralId)
      .select(`
        *,
        patient:patient_id(name, email),
        doctor:doctor_id(name, email)
      `)
      .single()

    if (updateError) {
      console.log('❌ Error updating referral:', updateError)
      throw updateError
    }

    console.log('✅ Referral accepted successfully:', updatedReferral)
    return NextResponse.json({ 
      message: 'Referral accepted successfully',
      referral: updatedReferral 
    })

  } catch (error) {
    console.error('🚨 Error accepting referral:', error)
    
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
        error: 'Failed to accept referral',
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
