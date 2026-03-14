# Health Platform (Healthie-like) – Development Plan

Tech Stack (MANDATORY)

Frontend: Next.js 14 (App Router)
Backend: Next.js API Routes / Server Actions
Database: Supabase PostgreSQL
Authentication: Supabase Auth
Storage: Supabase Storage
Realtime: Supabase Realtime
Styling: TailwindCSS
Hosting: Vercel
AI Coding Tool: Codex

Goal:
Build an API-first virtual healthcare platform similar to Healthie.

--------------------------------------------------

# PHASE 1 — PROJECT INITIALIZATION

## Task 1.1 — Create Next.js App

Run:

npx create-next-app@latest health-platform --typescript --tailwind --app

Options:

App Router: YES
Tailwind: YES
ESLint: YES
src folder: YES

--------------------------------------------------

## Task 1.2 — Install Dependencies

npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
npm install react-hook-form
npm install zod
npm install date-fns
npm install clsx
npm install lucide-react

--------------------------------------------------

## Task 1.3 — Project Folder Structure

Create folders:

src/

app/
components/
lib/
services/
hooks/
types/
validators/
repositories/
modules/

--------------------------------------------------

# PHASE 2 — SUPABASE SETUP

## Task 2.1 — Create Supabase Project

Go to:

https://supabase.com

Create project.

Save keys:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

--------------------------------------------------

## Task 2.2 — Create Supabase Client

File:

src/lib/supabaseClient.ts

Create a reusable Supabase client for frontend and backend usage.

--------------------------------------------------

## Task 2.3 — Setup Supabase CLI

Install CLI:

npm install -g supabase

Login:

supabase login

Initialize project:

supabase init

--------------------------------------------------

# PHASE 3 — DATABASE SCHEMA (MIGRATIONS)

Create migrations folder:

supabase/migrations

--------------------------------------------------

## Tables to Create

users  
organizations  
patients  
providers  
appointments  
medical_records  
clinical_notes  
prescriptions  
messages  
notifications  
audit_logs  

--------------------------------------------------

## Relationships

users → patients  
users → providers  
organizations → providers  
patients → appointments  
providers → appointments  
appointments → clinical_notes  

--------------------------------------------------

# PHASE 4 — AUTHENTICATION SYSTEM

## Task 4.1 — Implement Signup

Roles:

patient
provider
admin

Fields:

email
password
role

--------------------------------------------------

## Task 4.2 — Login Page

Pages:

/login
/signup

Use Supabase Auth.

--------------------------------------------------

## Task 4.3 — Role Based Access

Implement middleware.

Rules:

patients → patient portal  
providers → provider dashboard  
admins → admin dashboard  

--------------------------------------------------

# PHASE 5 — PATIENT PORTAL

Create routes:

/patient/dashboard
/patient/appointments
/patient/records
/patient/prescriptions
/patient/messages

Features:

view profile  
book appointment  
view medical records  
chat with provider  

--------------------------------------------------

# PHASE 6 — PROVIDER DASHBOARD

Routes:

/provider/dashboard
/provider/patients
/provider/appointments
/provider/notes
/provider/prescriptions

Features:

view patient list  
appointment queue  
create clinical notes  
issue prescriptions  

--------------------------------------------------

# PHASE 7 — APPOINTMENT SYSTEM

Features:

provider availability calendar
appointment booking
reschedule appointment
cancel appointment
status tracking

Fields:

patient_id
provider_id
scheduled_at
status
video_link

--------------------------------------------------

# PHASE 8 — VIDEO CONSULTATION

Use one of:

WebRTC
Daily.co
Twilio Video

For MVP:

generate meeting link.

Attach link to appointment.

--------------------------------------------------

# PHASE 9 — ELECTRONIC HEALTH RECORDS

Medical Records include:

diagnosis
notes
documents
treatment plan

Upload documents to:

Supabase Storage.

--------------------------------------------------

# PHASE 10 — CLINICAL NOTES

Provider can create notes:

SOAP format:

Subjective  
Objective  
Assessment  
Plan  

Attach to appointment.

--------------------------------------------------

# PHASE 11 — PRESCRIPTION SYSTEM

Fields:

medication_name
dosage
instructions
duration
provider_id
patient_id

Patients can view prescriptions.

--------------------------------------------------

# PHASE 12 — MESSAGING SYSTEM

Features:

patient ↔ provider chat

Use:

Supabase Realtime

Tables:

messages

Fields:

sender_id
receiver_id
message
timestamp

--------------------------------------------------

# PHASE 13 — NOTIFICATIONS

Notifications for:

new message
appointment reminder
new prescription

Use Supabase realtime or polling.

--------------------------------------------------

# PHASE 14 — SECURITY

Implement:

Row Level Security (RLS)

Rules:

patients only access their records
providers access their patients
admins access everything

Also add:

audit logs

--------------------------------------------------

# PHASE 15 — UI DESIGN

Design principles:

clean medical UI
blue/white color palette
simple dashboard layouts
accessible forms

Use:

TailwindCSS

--------------------------------------------------

# PHASE 16 — API ROUTES

Create endpoints:

/api/auth
/api/patients
/api/providers
/api/appointments
/api/records
/api/prescriptions
/api/messages
/api/notifications

--------------------------------------------------

# PHASE 17 — DEPLOYMENT

Push project to GitHub.

Deploy on:

https://vercel.com

Add environment variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

--------------------------------------------------

# PHASE 18 — POST MVP FEATURES

After MVP add:

AI clinical note generator
AI triage assistant
remote patient monitoring
analytics dashboard
insurance billing
FHIR integrations

--------------------------------------------------

# MVP SUCCESS CRITERIA

Patient can:

register
login
book appointment
join video consultation
view medical records
chat with provider

Provider can:

view patients
conduct appointments
create clinical notes
issue prescriptions

--------------------------------------------------

# END OF DEVELOPMENT PLAN