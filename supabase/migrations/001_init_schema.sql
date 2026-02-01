-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (integrates with Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Records table (main data)
CREATE TABLE public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Form data (JSON for flexibility)
  form_data JSONB NOT NULL,
  
  -- Auto-generated fields (NOT user-editable)
  generated_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_upto TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  
  -- Unique identifiers
  public_token TEXT UNIQUE NOT NULL,  -- Used in public URL
  qr_code_url TEXT,                   -- Stored URL to QR image (Supabase Storage)
  pdf_url TEXT,                       -- Stored URL to PDF file (Supabase Storage)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Denormalized for faster queries
  total_scans INTEGER DEFAULT 0,
  last_scan_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_records_user_id ON public.records(user_id);
CREATE INDEX idx_records_public_token ON public.records(public_token);
CREATE INDEX idx_records_created_at ON public.records(created_at DESC);
CREATE INDEX idx_records_valid_upto ON public.records(valid_upto);
CREATE INDEX idx_records_status ON public.records(status);

-- Scan logs table (track QR scans)
CREATE TABLE public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES public.records(id) ON DELETE CASCADE,
  
  -- Scan metadata
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  
  -- Session tracking
  session_id TEXT
);

CREATE INDEX idx_scan_logs_record_id ON public.scan_logs(record_id);
CREATE INDEX idx_scan_logs_scanned_at ON public.scan_logs(scanned_at DESC);
CREATE INDEX idx_scan_logs_session_id ON public.scan_logs(session_id);

-- Form templates table (store reusable form schemas)
CREATE TABLE public.form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,  -- Form field definitions
  
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_form_templates_user_id ON public.form_templates(user_id);

-- Audit logs table (security & compliance)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL,  -- 'create_record', 'download_pdf', 'view_record', etc.
  entity_type TEXT NOT NULL,  -- 'record', 'user', 'form'
  entity_id UUID,
  
  old_values JSONB,
  new_values JSONB,
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies: Records belong to user
CREATE POLICY "Users can read own records" ON public.records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON public.records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON public.records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON public.records
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: Scan logs (allow public viewing of record data via public_token)
-- This is handled in the application layer via public API

-- RLS Policies: Form templates belong to user
CREATE POLICY "Users can read own templates" ON public.form_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON public.form_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.form_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.form_templates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: Audit logs (only admins can view)
CREATE POLICY "Only admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create default form template (sample)
INSERT INTO public.form_templates (user_id, name, description, schema, is_default)
VALUES (
  NULL,
  'Default Form Template',
  'Sample form for demonstration',
  '[
    {
      "id": "field_1",
      "name": "applicant_name",
      "label": "Applicant Name",
      "type": "text",
      "required": true,
      "validation": {"minLength": 2, "maxLength": 100}
    },
    {
      "id": "field_2",
      "name": "applicant_email",
      "label": "Email Address",
      "type": "email",
      "required": true
    },
    {
      "id": "field_3",
      "name": "applicant_phone",
      "label": "Phone Number",
      "type": "phone",
      "required": true
    },
    {
      "id": "field_4",
      "name": "application_date",
      "label": "Application Date",
      "type": "date",
      "required": true
    },
    {
      "id": "field_5",
      "name": "application_type",
      "label": "Application Type",
      "type": "select",
      "required": true,
      "options": [
        {"label": "Standard", "value": "standard"},
        {"label": "Express", "value": "express"},
        {"label": "Premium", "value": "premium"}
      ]
    },
    {
      "id": "field_6",
      "name": "description",
      "label": "Additional Details",
      "type": "textarea",
      "required": false,
      "validation": {"maxLength": 500}
    }
  ]'::jsonb,
  true
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON public.records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_templates_updated_at BEFORE UPDATE ON public.form_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-expire records
CREATE OR REPLACE FUNCTION check_record_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.valid_upto < now() AND NEW.status = 'active' THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_records_expiry BEFORE UPDATE ON public.records
  FOR EACH ROW EXECUTE FUNCTION check_record_expiry();

-- Views for analytics
CREATE VIEW public.record_analytics AS
SELECT 
  date_trunc('day', created_at)::DATE as created_date,
  COUNT(*) as records_created,
  user_id
FROM public.records
GROUP BY date_trunc('day', created_at), user_id;

CREATE VIEW public.scan_analytics AS
SELECT 
  date_trunc('day', scanned_at)::DATE as scanned_date,
  COUNT(*) as total_scans,
  record_id
FROM public.scan_logs
GROUP BY date_trunc('day', scanned_at), record_id;
