import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  console.log('🏗️ Setting up database schema...')
  
  try {
    // Check if users table exists
    console.log('🔍 Checking if users table exists...')
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error && error.code === 'PGRST106') {
      console.log('❌ Users table does not exist')
      return NextResponse.json({
        success: false,
        error: 'Users table does not exist',
        message: 'Please run the SQL schema from INTEGRATION_SETUP.md in your Supabase dashboard',
        code: error.code,
        hint: 'Go to Supabase Dashboard → SQL Editor → Run the schema'
      }, { status: 400 })
    }

    if (error) {
      console.log('❌ Other database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    console.log('✅ Users table exists and is accessible')
    return NextResponse.json({
      success: true,
      message: 'Database schema is properly set up',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.log('🚨 Setup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Database setup check failed'
    }, { status: 500 })
  }
}
