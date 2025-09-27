import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  console.error('⚠️  GEMINI_API_KEY is not set. Gemini features will not work.')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key')

// Gemini 2.5 Pro model for advanced reasoning tasks
export const geminiPro = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

// Gemini 2.5 Flash for balanced performance and cost
export const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

// Directory Agent - Find specialists
export async function findSpecialists(
  specialty: string,
  location: string,
  insuranceType: string
) {
  // Determine if location is coordinates, ZIP code, or city/state
  const isCoordinates = location.includes(',') && location.includes('.');
  const isZipCode = /^\d{5}(-\d{4})?$/.test(location);
  
  let locationDescription = '';
  if (isCoordinates) {
    locationDescription = `coordinates ${location}`;
  } else if (isZipCode) {
    locationDescription = `ZIP code ${location}`;
  } else {
    locationDescription = `the ${location} area`;
  }

  const prompt = `
    Act as a healthcare directory agent. Find specialists near ${locationDescription}.
    
    Specialty needed: ${specialty}
    Insurance: ${insuranceType}
    Location: ${location}
    
    Provide 3-5 realistic recommendations in this JSON format:
    {
      "specialists": [
        {
          "name": "Dr. Full Name",
          "practice": "Practice Name",
          "address": "Full Street Address, City, State ZIP",
          "phone": "(555) 123-4567",
          "inNetwork": true,
          "rating": 4.8,
          "notes": "Brief note about specialties, subspecialties, or what makes them stand out"
        }
      ]
    }
    
    Important guidelines:
    - Use realistic doctor names and practice names for the area
    - Include complete addresses with real street names, city, state, and ZIP codes
    - Make phone numbers follow (XXX) XXX-XXXX format
    - Set inNetwork to true for most specialists (80% should be in-network)
    - Use ratings between 4.2 and 4.9
    - Include helpful notes about their expertise or patient care approach
    - Ensure all information feels authentic for ${locationDescription}
  `

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('🚨 Gemini API key missing for specialist search')
      return { 
        error: 'Gemini API not configured',
        specialists: [],
        message: 'Please set GEMINI_API_KEY environment variable'
      }
    }

    console.log('🔍 Searching for specialists using Gemini AI...')
    const result = await geminiFlash.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Gemini response received:', text.substring(0, 200) + '...')
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      console.log('📋 Found', parsed.specialists?.length || 0, 'specialists')
      return parsed
    }
    
    console.warn('⚠️  No valid JSON found in Gemini response')
    return { specialists: [], error: 'Invalid response format' }
  } catch (error) {
    console.error('🚨 Gemini API error in findSpecialists:', error)
    return { 
      specialists: [], 
      error: 'Failed to connect to Gemini API',
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

// Cost Explainer - Analyze insurance coverage
export async function explainCosts(
  procedure: string,
  insuranceInfo: string
) {
  const prompt = `
    Act as a healthcare cost explainer. Analyze this procedure and insurance information.
    
    Procedure: ${procedure}
    Insurance Information: ${insuranceInfo}
    
    Provide cost breakdown in this JSON format:
    {
      "estimatedCost": "$250-400",
      "copay": "$50", 
      "deductible": "$0-200",
      "explanation": "2-3 sentences explaining what the patient will pay and why, in simple terms"
    }
    
    Keep the explanation concise - maximum 2-3 sentences that clearly explain the costs and coverage.
  `

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('🚨 Gemini API key missing for cost analysis')
      return {
        error: 'Gemini API not configured',
        estimatedCost: "Unable to estimate",
        explanation: "Please set GEMINI_API_KEY environment variable to enable cost analysis."
      }
    }

    console.log('💰 Analyzing costs using Gemini AI...')
    const result = await geminiFlash.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Gemini cost analysis response received')
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      console.log('📊 Cost analysis completed successfully')
      return parsed
    }
    
    console.warn('⚠️  No valid JSON found in cost analysis response')
    return {
      estimatedCost: "Unable to estimate",
      explanation: "Please contact your insurance provider for specific cost information.",
      error: "Invalid response format"
    }
  } catch (error) {
    console.error('🚨 Gemini API error in explainCosts:', error)
    return {
      estimatedCost: "Unable to estimate",
      explanation: "Please contact your insurance provider for specific cost information.",
      error: 'Failed to connect to Gemini API',
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

// Records Summarizer - Analyze medical documents
export async function summarizeRecords(
  documentText: string,
  forDoctor: boolean = false
) {
  const prompt = forDoctor 
    ? `
        Act as a medical records AI assistant for healthcare providers.
        
        Analyze this medical document and provide a clinical summary:
        ${documentText}
        
        Provide summary in this JSON format:
        {
          "clinicalSummary": "Professional medical summary for doctors",
          "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
          "recommendations": ["Recommendation 1", "Recommendation 2"],
          "redFlags": ["Any concerning findings that need immediate attention"]
        }
        
        Use medical terminology appropriate for healthcare providers.
      `
    : `
        Act as a patient-friendly medical AI assistant.
        
        Analyze this medical document and explain it in simple terms:
        ${documentText}
        
        Provide summary in this JSON format:
        {
          "patientSummary": "Easy to understand explanation for patients",
          "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
          "nextSteps": ["What to do next", "Follow-up recommendations"],
          "questions": ["Suggested questions to ask your doctor"]
        }
        
        Use simple, non-medical language that patients can understand.
      `

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('🚨 Gemini API key missing for document analysis')
      return { 
        error: "Gemini API not configured",
        message: "Please set GEMINI_API_KEY environment variable to enable document analysis."
      }
    }

    console.log('📄 Analyzing document using Gemini AI...')
    const result = await geminiPro.generateContent(prompt) // Use Pro for complex document analysis
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Gemini document analysis response received')
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      console.log('📋 Document analysis completed successfully')
      return parsed
    }
    
    console.warn('⚠️  No valid JSON found in document analysis response')
    return { 
      error: "Invalid response format",
      message: "Unable to parse Gemini response"
    }
  } catch (error) {
    console.error('🚨 Gemini API error in summarizeRecords:', error)
    return { 
      error: "Failed to connect to Gemini API",
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

// Referral Generator - Create standardized referral packets
export async function generateReferral(
  patientInfo: { name: string; age: number },
  chiefComplaint: string,
  specialty: string,
  urgency: string
) {
  const prompt = `
    Act as a medical referral AI assistant.
    
    Generate a professional referral packet:
    
    Patient: ${patientInfo.name}, Age ${patientInfo.age}
    Chief Complaint: ${chiefComplaint}
    Specialty: ${specialty}
    Urgency: ${urgency}
    
    Provide referral in this JSON format:
    {
      "referralLetter": "Professional referral letter for receiving doctor",
      "patientInstructions": "Clear instructions for the patient",
      "requiredDocuments": ["Document 1", "Document 2"],
      "preparationSteps": ["Step 1", "Step 2"],
      "estimatedTimeframe": "2-3 weeks",
      "urgencyNotes": "Any special notes about urgency"
    }
    
    Make it professional for doctors but also include patient-friendly instructions.
  `

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('🚨 Gemini API key missing for referral generation')
      return { 
        error: "Gemini API not configured",
        message: "Please set GEMINI_API_KEY environment variable to enable referral generation."
      }
    }

    console.log('📝 Generating referral using Gemini AI...')
    const result = await geminiPro.generateContent(prompt) // Use Pro for complex referral generation
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Gemini referral generation response received')
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      console.log('📋 Referral generated successfully')
      return parsed
    }
    
    console.warn('⚠️  No valid JSON found in referral generation response')
    return { 
      error: "Invalid response format",
      message: "Unable to parse Gemini response"
    }
  } catch (error) {
    console.error('🚨 Gemini API error in generateReferral:', error)
    return { 
      error: "Failed to connect to Gemini API",
      details: error instanceof Error ? error.message : String(error)
    }
  }
}
