-- ==============================================================================
-- PAGADIAN CAPITOL COLLEGE (PCC) ALUMNI PORTAL - SUPABASE DATABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. PROFILES TABLE (Stores individual user profile data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  student_id TEXT,
  gender TEXT DEFAULT 'Not specified',
  birthdate TEXT,
  phone TEXT,
  address TEXT,
  course TEXT,
  year INT,
  avatar TEXT DEFAULT 'AL',
  cover_photo TEXT,
  position TEXT,
  company TEXT,
  location TEXT,
  saying TEXT,
  linkedin TEXT,
  github TEXT,
  facebook TEXT,
  instagram TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. ALUMNI DIRECTORY TABLE (Master records for alumni graduates)
CREATE TABLE IF NOT EXISTS public.alumni_directory (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  student_id TEXT,
  gender TEXT DEFAULT 'Not specified',
  birthdate TEXT,
  course TEXT NOT NULL,
  year INT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  company TEXT,
  position TEXT,
  location TEXT,
  employment_status TEXT DEFAULT 'Employed',
  status TEXT DEFAULT 'Active',
  avatar TEXT DEFAULT 'AL',
  saying TEXT,
  linkedin TEXT,
  github TEXT,
  facebook TEXT,
  instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. USERS TABLE (Stores registered user authentication accounts & roles)
CREATE TABLE IF NOT EXISTS public.users (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Alumni',
  status TEXT DEFAULT 'Active',
  password_hash TEXT,
  salt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. JOURNEY POSTS TABLE (Timeline post updates shared by alumni)
CREATE TABLE IF NOT EXISTS public.journey_posts (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_avatar TEXT DEFAULT 'AL',
  author_course TEXT,
  author_year INT,
  content TEXT NOT NULL,
  image TEXT,
  date TEXT DEFAULT 'Just now',
  likes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. ANNOUNCEMENTS TABLE (Official campus announcements & events)
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  created_by TEXT DEFAULT 'PCC Alumni Relations',
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. EMPLOYMENT RECORDS TABLE (Career tracking history per alumnus)
CREATE TABLE IF NOT EXISTS public.employment_records (
  id TEXT PRIMARY KEY,
  alumni_email TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'Active',
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. BATCH GRADUATE DOCUMENTS TABLE (Batch Excel uploads stored by Admin)
CREATE TABLE IF NOT EXISTS public.batch_documents (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  batch_year INT NOT NULL,
  upload_date TEXT NOT NULL,
  uploaded_by TEXT DEFAULT 'PCC Admin',
  file_size TEXT,
  total_graduates INT DEFAULT 0,
  course_counts JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. NOTIFICATIONS TABLE (Journey endorsements & connection requests)
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_avatar TEXT DEFAULT 'PCC',
  recipient_email TEXT,
  type TEXT NOT NULL, -- 'endorsement', 'connection_request', 'connection_accepted'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT DEFAULT 'Just now',
  read BOOLEAN DEFAULT false,
  status TEXT, -- 'pending', 'accepted', 'declined'
  alumni_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. CONNECTIONS TABLE (Network connections established between alumni)
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  connected_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_email, connected_email)
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) WITH PUBLIC ACCESS FOR DEMO DEVELOPMENT
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Allow full public read/write access policies (Can be tightened with Auth)
CREATE POLICY "Public Read/Write Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Alumni" ON public.alumni_directory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Journey Posts" ON public.journey_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Employment" ON public.employment_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Batch Docs" ON public.batch_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Connections" ON public.connections FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA (Inserts Regie, Jhonamery, Danilo & PCC Admin Accounts)
-- ==============================================================================
INSERT INTO public.users (id, name, email, role, status)
VALUES 
  (1, 'PCC Admin', 'admin@pcc.edu.ph', 'Admin', 'Active'),
  (2, 'Regie', 'regie@pcc.edu.ph', 'Alumni', 'Active'),
  (3, 'Jhonamery', 'jhonamery@pcc.edu.ph', 'Alumni', 'Active'),
  (4, 'Danilo', 'danilo@pcc.edu.ph', 'Alumni', 'Active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (email, name, student_id, gender, course, year, avatar, position, company, location, saying)
VALUES 
  ('admin@pcc.edu.ph', 'PCC Admin', 'ADMIN-001', 'Not specified', 'BSIT', 2024, 'PA', 'System Administrator', 'Pagadian Capitol College', 'Pagadian City', 'Excellence in PCC Education'),
  ('regie@pcc.edu.ph', 'Regie', '2024-BSIT-0101', 'Male', 'Bachelor of Science in Information Technology (BSIT)', 2024, 'RG', 'Software Engineer', 'PCC Tech Innovations', 'Pagadian City', 'Innovating technology for the PCC community!'),
  ('jhonamery@pcc.edu.ph', 'Jhonamery', '2024-BSBA-0202', 'Female', 'Bachelor of Science in Business Administration (BSBA)', 2024, 'JH', 'Business Analyst', 'Capitol Enterprise Solutions', 'Pagadian City', 'Striving for business excellence and leadership.'),
  ('danilo@pcc.edu.ph', 'Danilo', '2023-BSA-0303', 'Male', 'Bachelor of Science in Accountancy (BSA)', 2023, 'DN', 'Financial Auditor', 'Pagadian Finance & Audit Corp', 'Pagadian City', 'Precision, dedication, and integrity in finance.')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.alumni_directory (id, name, student_id, gender, course, year, email, phone, address, company, position, location, employment_status, status, avatar, saying)
VALUES 
  (1, 'PCC Admin', 'ADMIN-001', 'Not specified', 'BSIT', 2024, 'admin@pcc.edu.ph', '09170000000', 'Pagadian City', 'Pagadian Capitol College', 'System Administrator', 'Pagadian City', 'Employed (Full-Time)', 'Active', 'PA', 'Excellence in PCC Education'),
  (2, 'Regie', '2024-BSIT-0101', 'Male', 'Bachelor of Science in Information Technology (BSIT)', 2024, 'regie@pcc.edu.ph', '09171234567', 'Pagadian City', 'PCC Tech Innovations', 'Software Engineer', 'Pagadian City', 'Employed (Full-Time)', 'Active', 'RG', 'Innovating technology for the PCC community!'),
  (3, 'Jhonamery', '2024-BSBA-0202', 'Female', 'Bachelor of Science in Business Administration (BSBA)', 2024, 'jhonamery@pcc.edu.ph', '09189876543', 'Pagadian City', 'Capitol Enterprise Solutions', 'Business Analyst', 'Pagadian City', 'Employed (Full-Time)', 'Active', 'JH', 'Striving for business excellence and leadership.'),
  (4, 'Danilo', '2023-BSA-0303', 'Male', 'Bachelor of Science in Accountancy (BSA)', 2023, 'danilo@pcc.edu.ph', '09193334444', 'Pagadian City', 'Pagadian Finance & Audit Corp', 'Financial Auditor', 'Pagadian City', 'Employed (Full-Time)', 'Active', 'DN', 'Precision, dedication, and integrity in finance.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.journey_posts (id, author_name, author_email, author_avatar, author_course, author_year, content, date, likes)
VALUES
  ('post_1', 'Regie', 'regie@pcc.edu.ph', 'RG', 'Bachelor of Science in Information Technology (BSIT)', 2024, 'Proud to share my latest software project developed for the PCC Alumni community!', 'Just now', 2),
  ('post_2', 'Jhonamery', 'jhonamery@pcc.edu.ph', 'JH', 'Bachelor of Science in Business Administration (BSBA)', 2024, 'Excited to announce my new role as Business Analyst at Capitol Enterprise Solutions!', '1d ago', 3),
  ('post_3', 'Danilo', 'danilo@pcc.edu.ph', 'DN', 'Bachelor of Science in Accountancy (BSA)', 2023, 'Successfully completed the quarterly financial audit. Always proud of my PCC training!', '2d ago', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.announcements (id, title, category, date, created_by, content, priority)
VALUES ('ann_1', 'Welcome to PCC Alumni Portal', 'Campus News', 'Sep 30 2026', 'PCC Alumni Relations', 'Welcome to the official Pagadian Capitol College Alumni Network! Connect with fellow graduates and explore career opportunities.', 'normal')
ON CONFLICT (id) DO NOTHING;


