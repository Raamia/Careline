import { useState, useEffect } from 'react'
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

      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      if (!response.ok) {
        throw new Error('Failed to sync user')
      }

      const data = await response.json()
      return data.user
    } catch (err) {
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

      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referralData)
      })

      if (!response.ok) {
        throw new Error('Failed to create referral')
      }

      const data = await response.json()
      return data.referral
    } catch (err) {
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
    patientInfo: any,
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
