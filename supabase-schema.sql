-- Careline Database Schema
-- Run this in your Supabase SQL editor

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('patient', 'doctor')) NOT NULL DEFAULT 'patient',
  profile_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referring_doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  specialty TEXT NOT NULL,
  chief_complaint TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('routine', 'urgent', 'stat')) DEFAULT 'routine',
  insurance_info TEXT,
  estimated_cost TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE,
  gemini_summary TEXT,
  patient_notes TEXT,
  doctor_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical records table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  gemini_summary JSONB,
  processed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Specialists directory table
CREATE TABLE specialists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  practice_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  insurance_accepted TEXT[],
  in_network BOOLEAN DEFAULT TRUE,
  rating DECIMAL(2,1),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages/Communications table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_type TEXT CHECK (message_type IN ('text', 'document', 'system')) DEFAULT 'text',
  content TEXT,
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_referrals_patient_id ON referrals(patient_id);
CREATE INDEX idx_referrals_doctor_id ON referrals(doctor_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_specialists_specialty ON specialists(specialty);
CREATE INDEX idx_messages_referral_id ON messages(referral_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specialists_updated_at BEFORE UPDATE ON specialists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Users can read their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth0_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth0_id = auth.jwt() ->> 'sub');

-- Referrals: patients see their referrals, doctors see referrals assigned to them
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view their referrals" ON referrals
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM users WHERE auth0_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Doctors can view assigned referrals" ON referrals
    FOR SELECT USING (
        doctor_id IN (
            SELECT id FROM users WHERE auth0_id = auth.jwt() ->> 'sub'
        )
        OR referring_doctor_id IN (
            SELECT id FROM users WHERE auth0_id = auth.jwt() ->> 'sub'
        )
    );

-- Medical records: patients see their records, doctors see records for their patients
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view their records" ON medical_records
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM users WHERE auth0_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Doctors can view patient records for their referrals" ON medical_records
    FOR SELECT USING (
        patient_id IN (
            SELECT DISTINCT patient_id FROM referrals 
            WHERE doctor_id IN (
                SELECT id FROM users WHERE auth0_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- Specialists are viewable by all authenticated users
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view specialists" ON specialists
    FOR SELECT USING (auth.role() = 'authenticated');

-- Sample data for testing
INSERT INTO specialists (name, specialty, practice_name, address, phone, insurance_accepted, rating) VALUES
('Dr. Sarah Johnson', 'Cardiology', 'Valley Medical Center', '123 Heart St, Tallahassee, FL 32304', '(850) 555-0101', ARRAY['Blue Cross', 'Aetna', 'Medicare'], 4.8),
('Dr. Michael Chen', 'Dermatology', 'Skin Health Clinic', '456 Skin Ave, Tallahassee, FL 32301', '(850) 555-0102', ARRAY['Blue Cross', 'Cigna', 'Medicare'], 4.6),
('Dr. Jennifer Kim', 'Primary Care', 'Family Healthcare', '789 Wellness Blvd, Tallahassee, FL 32308', '(850) 555-0103', ARRAY['All Major Insurance'], 4.9),
('Dr. Robert Smith', 'Emergency Medicine', 'Tallahassee General Hospital', '321 Emergency Dr, Tallahassee, FL 32310', '(850) 555-0104', ARRAY['All Insurance'], 4.5),
('Dr. Lisa Martinez', 'Orthopedics', 'Bone & Joint Institute', '654 Ortho Way, Tallahassee, FL 32312', '(850) 555-0105', ARRAY['Blue Cross', 'UnitedHealth', 'Medicare'], 4.7);
