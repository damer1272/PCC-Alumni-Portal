# 🚀 Supabase Integration Setup Guide for Pagadian Capitol College Alumni Portal

Your PCC Alumni Portal codebase is now **100% pre-configured and ready** to connect to Supabase! Follow these simple steps to link your Supabase database.

---

## Step 1: Create a Free Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project** (or Sign In).
2. Click **New Project** and select your organization.
3. Fill in the details:
   - **Name**: `PCC Alumni Portal`
   - **Database Password**: Enter a strong password
   - **Region**: Select Southeast Asia (Singapore) or nearest region
4. Click **Create new project** and wait 1–2 minutes for setup to complete.

---

## Step 2: Get Your Project URL & Anon Key

1. Inside your Supabase Project Dashboard, click the **Settings** icon (gear) in the bottom-left menu.
2. Select **API** (under Project Settings).
3. Copy the following two values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **Project API Keys -> `anon` `public`** (e.g., `eyJhbGciOi...`)

---

## Step 3: Add Credentials to `.env` File

Open the `.env` file in the root of your project directory (`c:\BACKUP PROJECTS\PCC Alumni Portal\.env`) and paste your credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key-here...
```

---

## Step 4: Run the Database Schema SQL Script

1. In your Supabase Dashboard, click on the **SQL Editor** tab (left sidebar menu icon `>_`).
2. Click **New Query**.
3. Open the file `supabase/schema.sql` from your project folder and copy all its contents.
4. Paste the SQL contents into the Supabase SQL Editor box.
5. Click **Run** (or press Ctrl + Enter).

> **Success!** Your Supabase tables (`profiles`, `alumni_directory`, `journey_posts`, `announcements`, `employment_records`, `batch_documents`, `notifications`, `connections`) are now created with Row-Level Security enabled!

---

## How It Works:

- **Automatic Hybrid Engine**:
  - When `.env` contains your Supabase credentials, the portal automatically syncs all graduates, announcements, journey updates, career tracking, and notifications directly to your live Supabase database!
  - If `.env` is empty or offline, the portal gracefully falls back to local storage so demo mode never crashes.
