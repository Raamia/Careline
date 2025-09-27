import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  console.log('🧪 Testing Supabase connection...')
  
  try {
    // Test basic connection
    console.log('📡 Testing basic Supabase connection...')
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })

    console.log('📊 Supabase test result:', { data, error })

    if (error) {
      console.log('❌ Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: 'Supabase connection failed'
      }, { status: 500 })
    }

    console.log('✅ Supabase connection successful')
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      count: data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.log('🚨 Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Test failed'
    }, { status: 500 })
  }
}
