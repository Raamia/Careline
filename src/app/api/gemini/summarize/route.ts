import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { summarizeRecords } from '@/lib/gemini'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentText, recordId, forDoctor = false } = body

    if (!documentText) {
      return NextResponse.json(
        { error: 'Document text is required' },
        { status: 400 }
      )
    }

    // Get user to check role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('auth0_id', session.user.sub)
      .single()

    // Call Gemini AI to summarize records
    const result = await summarizeRecords(documentText, forDoctor || user?.role === 'doctor')

    // If recordId provided, update the record with the summary
    if (recordId && !result.error) {
      await supabase
        .from('medical_records')
        .update({
          gemini_summary: result,
          processed: true
        })
        .eq('id', recordId)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error summarizing records:', error)
    return NextResponse.json(
      { error: 'Failed to summarize records' },
      { status: 500 }
    )
  }
}
