import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { findSpecialists } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { specialty, zipCode, insuranceType } = body

    if (!specialty || !zipCode) {
      return NextResponse.json(
        { error: 'Specialty and ZIP code are required' },
        { status: 400 }
      )
    }

    // Call Gemini AI to find specialists
    const result = await findSpecialists(specialty, zipCode, insuranceType || 'General')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error finding specialists:', error)
    return NextResponse.json(
      { error: 'Failed to find specialists' },
      { status: 500 }
    )
  }
}
