import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 Test referrals endpoint called')
  return NextResponse.json({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  console.log('🧪 Test referrals POST endpoint called')
  try {
    const body = await request.json()
    console.log('📥 Test POST body:', body)
    return NextResponse.json({ 
      message: 'Test POST working!',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.log('❌ Test POST error:', error)
    return NextResponse.json({ error: 'Test POST failed' }, { status: 500 })
  }
}
