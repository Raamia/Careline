import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Gemini Pro model for general queries
export const geminiPro = genAI.getGenerativeModel({ model: 'gemini-pro' })

// Gemini Pro Vision for document analysis
export const geminiProVision = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

// Directory Agent - Find specialists
export async function findSpecialists(
  specialty: string,
  zipCode: string,
  insuranceType: string
) {
  const prompt = `
    Act as a healthcare directory agent. Find specialists near ZIP code ${zipCode}.
    
    Specialty needed: ${specialty}
    Insurance: ${insuranceType}
    
    Provide 3-5 recommendations in this JSON format:
    {
      "specialists": [
        {
          "name": "Dr. Full Name",
          "practice": "Practice Name",
          "address": "Full Address",
          "phone": "(555) 123-4567",
          "inNetwork": true,
          "rating": 4.8,
          "notes": "Brief note about specialties or expertise"
        }
      ]
    }
    
    Make the recommendations realistic for the ${zipCode} area.
  `

  try {
    const result = await geminiPro.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return { specialists: [] }
  } catch (error) {
    console.error('Gemini API error:', error)
    return { specialists: [] }
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
      "explanation": "Plain English explanation of what patient will pay",
      "notes": "Additional notes about coverage or requirements"
    }
    
    Make the explanation simple and patient-friendly.
  `

  try {
    const result = await geminiPro.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return {
      estimatedCost: "Unable to estimate",
      explanation: "Please contact your insurance provider for specific cost information."
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      estimatedCost: "Unable to estimate",
      explanation: "Please contact your insurance provider for specific cost information."
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
    const result = await geminiPro.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return { error: "Unable to process document" }
  } catch (error) {
    console.error('Gemini API error:', error)
    return { error: "Unable to process document" }
  }
}

// Referral Generator - Create standardized referral packets
export async function generateReferral(
  patientInfo: any,
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
    const result = await geminiPro.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return { error: "Unable to generate referral" }
  } catch (error) {
    console.error('Gemini API error:', error)
    return { error: "Unable to generate referral" }
  }
}
