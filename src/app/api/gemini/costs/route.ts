import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { explainCosts } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { procedure, insuranceInfo } = body

    if (!procedure) {
      return NextResponse.json(
        { error: 'Procedure is required' },
        { status: 400 }
      )
    }

    // Call Gemini AI to explain costs
    const result = await explainCosts(procedure, insuranceInfo || 'No insurance information provided')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error explaining costs:', error)
    return NextResponse.json(
      { error: 'Failed to explain costs' },
      { status: 500 }
    )
  }
}
