import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database Types
export interface User {
  id: string
  auth0_id: string
  email: string
  name: string
  role: 'patient' | 'doctor'
  created_at: string
  updated_at: string
}

export interface Referral {
  id: string
  patient_id: string
  doctor_id?: string
  referring_doctor_id?: string
  specialty: string
  chief_complaint: string
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  priority: 'routine' | 'urgent' | 'stat'
  insurance_info?: string
  estimated_cost?: string
  appointment_date?: string
  gemini_summary?: string
  created_at: string
  updated_at: string
}

export interface MedicalRecord {
  id: string
  patient_id: string
  referral_id?: string
  file_name: string
  file_url: string
  file_type: string
  gemini_summary?: string
  processed: boolean
  created_at: string
}

export interface Specialist {
  id: string
  name: string
  specialty: string
  practice_name: string
  address: string
  phone: string
  insurance_accepted: string[]
  in_network: boolean
  rating?: number
  created_at: string
}
