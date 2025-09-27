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

    const formData = await request.formData()
    const documentFile = formData.get('documentFile') as File
    const recordId = formData.get('recordId') as string
    const forDoctor = formData.get('forDoctor') === 'true'

    if (!documentFile) {
      return NextResponse.json(
        { error: 'Document file is required' },
        { status: 400 }
      )
    }

    if (documentFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

    // Get user to check role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('auth0_id', session.user.sub)
      .single()

    // Call Gemini AI to summarize records with PDF
    const result = await summarizeRecords(documentFile, forDoctor || user?.role === 'doctor')

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
