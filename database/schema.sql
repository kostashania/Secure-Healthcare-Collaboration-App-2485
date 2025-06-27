-- HealthCare Collaboration Database Schema
-- Complete database setup for all features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles table
CREATE TABLE IF NOT EXISTS user_profiles_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse', 'admin', 'sponsor', 'office_manager')),
  phone_number VARCHAR(20) NOT NULL,
  amka VARCHAR(11) UNIQUE NOT NULL,
  date_of_birth DATE,
  specialization VARCHAR(255),
  license_number VARCHAR(100),
  bio TEXT,
  custom_field_1 VARCHAR(255),
  custom_field_2 VARCHAR(255),
  custom_field_3 VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Types table
CREATE TABLE IF NOT EXISTS document_types_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default document types
INSERT INTO document_types_hc2024 (id, name, description, color) VALUES
  ('dt-lab', 'Lab Results', 'Laboratory test results and reports', '#3b82f6'),
  ('dt-prescription', 'Prescription', 'Medication prescriptions', '#22c55e'),
  ('dt-scan', 'Medical Scan', 'X-rays, MRI, CT scans, ultrasounds', '#8b5cf6'),
  ('dt-report', 'Medical Report', 'Doctor reports and medical summaries', '#f59e0b'),
  ('dt-insurance', 'Insurance', 'Insurance documents and claims', '#6366f1'),
  ('dt-other', 'Other', 'Other medical documents', '#6b7280')
ON CONFLICT (id) DO NOTHING;

-- Examination Rooms table
CREATE TABLE IF NOT EXISTS examination_rooms_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default examination rooms
INSERT INTO examination_rooms_hc2024 (id, name, description) VALUES
  ('room-1', 'Room 101', 'General consultation room'),
  ('room-2', 'Room 102', 'Cardiology examination room'),
  ('room-3', 'Room 103', 'Emergency examination room'),
  ('room-4', 'Lab Room', 'Laboratory testing room'),
  ('room-5', 'Surgery Room A', 'Main surgery room'),
  ('room-6', 'Therapy Room', 'Physical therapy room')
ON CONFLICT (id) DO NOTHING;

-- Connection Requests table
CREATE TABLE IF NOT EXISTS connection_requests_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES user_profiles_hc2024(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES user_profiles_hc2024(id) ON DELETE CASCADE,
  requester_role VARCHAR(50) NOT NULL,
  recipient_role VARCHAR(50) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Connections table
CREATE TABLE IF NOT EXISTS user_connections_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES user_profiles_hc2024(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES user_profiles_hc2024(id) ON DELETE CASCADE,
  connection_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type_id UUID NOT NULL REFERENCES document_types_hc2024(id),
  patient_id UUID NOT NULL REFERENCES user_profiles_hc2024(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES user_profiles_hc2024(id),
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Tags table
CREATE TABLE IF NOT EXISTS document_tags_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents_hc2024(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_by UUID NOT NULL REFERENCES user_profiles_hc2024(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  patient_id UUID NOT NULL REFERENCES user_profiles_hc2024(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES user_profiles_hc2024(id) ON DELETE CASCADE,
  room_id UUID REFERENCES examination_rooms_hc2024(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 30,
  type VARCHAR(50) DEFAULT 'consultation',
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  location VARCHAR(255),
  notes TEXT,
  memo TEXT,
  qr_code VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointment Documents junction table
CREATE TABLE IF NOT EXISTS appointment_documents_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments_hc2024(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents_hc2024(id) ON DELETE CASCADE,
  attached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(appointment_id, document_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  patient_id UUID NOT NULL REFERENCES user_profiles_hc2024(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES user_profiles_hc2024(id),
  assigned_by UUID NOT NULL REFERENCES user_profiles_hc2024(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Documents junction table
CREATE TABLE IF NOT EXISTS task_documents_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks_hc2024(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents_hc2024(id) ON DELETE CASCADE,
  attached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, document_id)
);

-- Advertisement Packages table
CREATE TABLE IF NOT EXISTS ad_packages_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_months INTEGER NOT NULL,
  price_euros INTEGER NOT NULL, -- Price in cents
  priority VARCHAR(20) DEFAULT 'bronze' CHECK (priority IN ('bronze', 'silver', 'gold', 'platinum')),
  display_probability INTEGER DEFAULT 10, -- Percentage
  max_ads INTEGER DEFAULT 5,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default ad packages
INSERT INTO ad_packages_hc2024 (id, name, description, duration_months, price_euros, priority, display_probability, max_ads, sort_order, features) VALUES
  ('pkg-bronze', 'Bronze Package', 'Basic advertising for small practices', 1, 1500, 'bronze', 10, 2, 1, '{"analytics": true, "basic_targeting": true}'),
  ('pkg-silver', 'Silver Package', 'Enhanced visibility for growing practices', 3, 4000, 'silver', 25, 5, 2, '{"analytics": true, "advanced_targeting": true, "priority_display": true}'),
  ('pkg-gold', 'Gold Package', 'Premium advertising with high visibility', 6, 7500, 'gold', 60, 10, 3, '{"analytics": true, "advanced_targeting": true, "priority_display": true, "featured_placement": true}'),
  ('pkg-platinum', 'Platinum Package', 'Ultimate exposure for large medical centers', 12, 12000, 'platinum', 5, 20, 4, '{"analytics": true, "advanced_targeting": true, "priority_display": true, "featured_placement": true, "dedicated_support": true}')
ON CONFLICT (id) DO NOTHING;

-- Advertisements table
CREATE TABLE IF NOT EXISTS advertisements_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  click_url TEXT,
  sponsor_id UUID NOT NULL REFERENCES user_profiles_hc2024(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES ad_packages_hc2024(id),
  priority VARCHAR(20) DEFAULT 'bronze',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'paused', 'rejected', 'expired')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  approved_by UUID REFERENCES user_profiles_hc2024(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles_hc2024(id),
  package_id UUID REFERENCES ad_packages_hc2024(id),
  amount_euros INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  stripe_payment_intent_id VARCHAR(255),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_display_duration INTEGER DEFAULT 8, -- seconds
  ad_rotation_enabled BOOLEAN DEFAULT true,
  priority_weights JSONB DEFAULT '{"platinum": 5, "gold": 60, "silver": 25, "bronze": 10}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings_hc2024 (ad_display_duration, ad_rotation_enabled, priority_weights) 
VALUES (8, true, '{"platinum": 5, "gold": 60, "silver": 25, "bronze": 10}')
ON CONFLICT DO NOTHING;

-- Custom Fields table
CREATE TABLE IF NOT EXISTS custom_fields_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(50) NOT NULL,
  field_number INTEGER NOT NULL CHECK (field_number IN (1, 2, 3)),
  field_label VARCHAR(255) NOT NULL,
  field_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, field_number)
);

-- Insert default custom field labels
INSERT INTO custom_fields_hc2024 (role, field_number, field_label, field_order) VALUES
  ('patient', 1, 'Insurance Information', 1),
  ('patient', 2, 'Emergency Contact', 2),
  ('patient', 3, 'Blood Type', 3),
  ('doctor', 1, 'Department', 1),
  ('doctor', 2, 'Years of Experience', 2),
  ('doctor', 3, 'Specialty Focus', 3),
  ('nurse', 1, 'Unit Assignment', 1),
  ('nurse', 2, 'Shift Preference', 2),
  ('nurse', 3, 'Certifications', 3),
  ('admin', 1, 'Department', 1),
  ('admin', 2, 'Access Level', 2),
  ('admin', 3, 'Responsibilities', 3),
  ('office_manager', 1, 'Department', 1),
  ('office_manager', 2, 'Experience Level', 2),
  ('office_manager', 3, 'Primary Duties', 3),
  ('sponsor', 1, 'Business Sector', 1),
  ('sponsor', 2, 'Sponsor Type', 2),
  ('sponsor', 3, 'Product Category', 3)
ON CONFLICT (role, field_number) DO NOTHING;

-- Doctor Specializations table
CREATE TABLE IF NOT EXISTS specializations_hc2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default specializations
INSERT INTO specializations_hc2024 (name, description) VALUES
  ('Cardiology', 'Heart and cardiovascular system'),
  ('Dermatology', 'Skin, hair, and nails'),
  ('Emergency Medicine', 'Emergency and urgent care'),
  ('Family Medicine', 'Primary care for all ages'),
  ('Internal Medicine', 'Adult internal medicine'),
  ('Neurology', 'Nervous system disorders'),
  ('Oncology', 'Cancer treatment and care'),
  ('Orthopedics', 'Musculoskeletal system'),
  ('Pediatrics', 'Medical care for children'),
  ('Psychiatry', 'Mental health and disorders'),
  ('Radiology', 'Medical imaging'),
  ('Surgery', 'Surgical procedures')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_documents_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_documents_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_hc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes_hc2024 ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles: Users can see their own profile, healthcare providers can see their patients, admins see all
CREATE POLICY "Users can view own profile" ON user_profiles_hc2024
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles_hc2024
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON user_profiles_hc2024
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_hc2024 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'office_manager')
    )
  );

-- Connection requests: Users can see requests they sent or received
CREATE POLICY "Users can view their connection requests" ON connection_requests_hc2024
  FOR SELECT USING (
    requester_id IN (SELECT id FROM user_profiles_hc2024 WHERE auth_user_id = auth.uid())
    OR recipient_id IN (SELECT id FROM user_profiles_hc2024 WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles_hc2024 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'office_manager')
    )
  );

CREATE POLICY "Users can create connection requests" ON connection_requests_hc2024
  FOR INSERT WITH CHECK (
    requester_id IN (SELECT id FROM user_profiles_hc2024 WHERE auth_user_id = auth.uid())
  );

-- Documents: Patients see their own, providers see their patients' documents
CREATE POLICY "Patients can view own documents" ON documents_hc2024
  FOR SELECT USING (
    patient_id IN (SELECT id FROM user_profiles_hc2024 WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Healthcare providers can view patient documents" ON documents_hc2024
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_hc2024 up
      WHERE up.auth_user_id = auth.uid() 
      AND up.role IN ('doctor', 'nurse', 'admin', 'office_manager')
    )
  );

-- Similar policies for other tables...

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles_hc2024(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles_hc2024(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_amka ON user_profiles_hc2024(amka);
CREATE INDEX IF NOT EXISTS idx_connection_requests_requester ON connection_requests_hc2024(requester_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_recipient ON connection_requests_hc2024(recipient_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests_hc2024(status);
CREATE INDEX IF NOT EXISTS idx_user_connections_user1 ON user_connections_hc2024(user1_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_user2 ON user_connections_hc2024(user2_id);
CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents_hc2024(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents_hc2024(type_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_document ON document_tags_hc2024(document_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments_hc2024(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments_hc2024(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments_hc2024(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_room ON appointments_hc2024(room_id);
CREATE INDEX IF NOT EXISTS idx_tasks_patient ON tasks_hc2024(patient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks_hc2024(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks_hc2024(status);
CREATE INDEX IF NOT EXISTS idx_advertisements_sponsor ON advertisements_hc2024(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_advertisements_status ON advertisements_hc2024(status);