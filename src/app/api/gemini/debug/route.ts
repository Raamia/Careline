import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    // Check Auth0 session
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Environment checks
    const hasApiKey = !!process.env.GEMINI_API_KEY
    const apiKeyLength = process.env.GEMINI_API_KEY?.length || 0
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        hasGeminiApiKey: hasApiKey,
        apiKeyLength: hasApiKey ? `${apiKeyLength} characters` : 'Not set',
        nodeEnv: process.env.NODE_ENV
      },
      tests: {}
    }

    // If no API key, return early
    if (!hasApiKey) {
      return NextResponse.json({
        ...results,
        status: 'error',
        message: 'GEMINI_API_KEY environment variable is not set',
        recommendation: 'Set your Gemini API key in environment variables'
      })
    }

    // Test Gemini connection
    try {
      console.log('🧪 Testing Gemini API connection...')
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      
      // Test with Gemini Flash (faster)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const testPrompt = 'Respond with exactly this JSON: {"status": "success", "message": "Gemini API is working"}'
      const result = await model.generateContent(testPrompt)
      const response = await result.response
      const text = response.text()
      
      console.log('✅ Gemini API test response:', text)
      
      results.tests = {
        connectionTest: {
          success: true,
          model: 'gemini-1.5-flash',
          responseReceived: true,
          responseLength: text.length,
          rawResponse: text.substring(0, 500) + (text.length > 500 ? '...' : '')
        }
      }

      // Try to parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          results.tests.connectionTest.jsonParsed = true
          results.tests.connectionTest.parsedResponse = parsed
        } catch (parseError) {
          results.tests.connectionTest.jsonParsed = false
          results.tests.connectionTest.parseError = parseError instanceof Error ? parseError.message : String(parseError)
        }
      } else {
        results.tests.connectionTest.jsonParsed = false
        results.tests.connectionTest.parseError = 'No JSON found in response'
      }

      return NextResponse.json({
        ...results,
        status: 'success',
        message: 'Gemini API is accessible and responding'
      })

    } catch (apiError) {
      console.error('🚨 Gemini API test failed:', apiError)
      
      results.tests = {
        connectionTest: {
          success: false,
          error: apiError instanceof Error ? apiError.message : String(apiError),
          errorType: apiError instanceof Error ? apiError.constructor.name : 'Unknown'
        }
      }

      // Analyze common error types
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError)
      let recommendation = 'Check your API key and try again'
      
      if (errorMessage.includes('API_KEY_INVALID')) {
        recommendation = 'Your Gemini API key appears to be invalid. Generate a new one at https://makersuite.google.com/app/apikey'
      } else if (errorMessage.includes('PERMISSION_DENIED')) {
        recommendation = 'Your API key lacks permissions. Ensure it has access to the Generative AI API'
      } else if (errorMessage.includes('QUOTA_EXCEEDED')) {
        recommendation = 'You have exceeded your API quota. Check your usage limits'
      } else if (errorMessage.includes('model not found')) {
        recommendation = 'The model name might be incorrect. Try updating to the latest version'
      }

      return NextResponse.json({
        ...results,
        status: 'error',
        message: 'Gemini API test failed',
        recommendation
      })
    }

  } catch (error) {
    console.error('🚨 Gemini debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed', 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
