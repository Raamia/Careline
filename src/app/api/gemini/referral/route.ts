import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { generateReferral } from '@/lib/gemini'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { referralId, patientInfo, chiefComplaint, specialty, urgency } = body

    if (!patientInfo || !chiefComplaint || !specialty) {
      return NextResponse.json(
        { error: 'Patient info, chief complaint, and specialty are required' },
        { status: 400 }
      )
    }

    // Call Gemini AI to generate referral
    const result = await generateReferral(patientInfo, chiefComplaint, specialty, urgency || 'routine')

    // If referralId provided, update the referral with generated content
    if (referralId && !result.error) {
      await supabase
        .from('referrals')
        .update({
          gemini_summary: result.referralLetter,
          patient_notes: result.patientInstructions,
          metadata: {
            requiredDocuments: result.requiredDocuments,
            preparationSteps: result.preparationSteps,
            estimatedTimeframe: result.estimatedTimeframe,
            urgencyNotes: result.urgencyNotes
          }
        })
        .eq('id', referralId)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating referral:', error)
    return NextResponse.json(
      { error: 'Failed to generate referral' },
      { status: 500 }
    )
  }
}
