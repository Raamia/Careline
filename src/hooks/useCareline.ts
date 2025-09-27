import { useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

// Custom hook for Careline API calls
export function useCareline() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync user with Supabase when they first log in
  const syncUser = async (role: 'patient' | 'doctor' = 'patient') => {
    if (!user) return null

    try {
      setLoading(true)
      setError(null)

      console.log('🔗 Making POST request to /api/users/sync')
      console.log('📤 Sync request data:', { role })

      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      console.log('📥 Sync response status:', response.status)
      console.log('📥 Sync response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ Sync response error text:', errorText)
        throw new Error(`Failed to sync user: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Sync response data:', data)
      return data.user
    } catch (err) {
      console.log('🚨 syncUser error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Get referrals for current user
  const getReferrals = async () => {
    if (!user) return []

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/referrals')
      if (!response.ok) {
        throw new Error('Failed to fetch referrals')
      }

      const data = await response.json()
      return data.referrals || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Create new referral
  const createReferral = async (referralData: {
    specialty: string
    chief_complaint: string
    priority?: 'routine' | 'urgent' | 'stat'
  }) => {
    if (!user) return null

    try {
      setLoading(true)
      setError(null)

      console.log('🔗 Making POST request to /api/referrals')
      console.log('📤 Request data:', referralData)
      
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referralData)
      })

      console.log('📥 Response status:', response.status)
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ Response error text:', errorText)
        throw new Error(`Failed to create referral: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Response data:', data)
      return data.referral
    } catch (err) {
      console.log('🚨 createReferral error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Find specialists using Gemini AI
  const findSpecialists = async (
    specialty: string,
    zipCode: string,
    insuranceType?: string
  ) => {
    if (!user) return { specialists: [] }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/gemini/specialists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty, zipCode, insuranceType })
      })

      if (!response.ok) {
        throw new Error('Failed to find specialists')
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return { specialists: [] }
    } finally {
      setLoading(false)
    }
  }

  // Explain costs using Gemini AI
  const explainCosts = async (procedure: string, insuranceInfo?: string) => {
    if (!user) return null

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/gemini/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ procedure, insuranceInfo })
      })

      if (!response.ok) {
        throw new Error('Failed to explain costs')
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Summarize medical records using Gemini AI
  const summarizeRecords = async (
    documentText: string,
    recordId?: string,
    forDoctor?: boolean
  ) => {
    if (!user) return null

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText, recordId, forDoctor })
      })

      if (!response.ok) {
        throw new Error('Failed to summarize records')
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Generate referral using Gemini AI
  const generateReferral = async (
    patientInfo: { name: string; age: number },
    chiefComplaint: string,
    specialty: string,
    urgency?: string,
    referralId?: string
  ) => {
    if (!user) return null

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/gemini/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientInfo,
          chiefComplaint,
          specialty,
          urgency,
          referralId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate referral')
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    syncUser,
    getReferrals,
    createReferral,
    findSpecialists,
    explainCosts,
    summarizeRecords,
    generateReferral
  }
}
