# Healthie — Health Platform

A full-stack healthcare management platform built with **Next.js 14**, **Supabase**, and **TailwindCSS**. Three user roles — **Patient**, **Provider**, and **Admin** — each with a dedicated portal.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier works)

### Installation

```bash
git clone <repository-url>
cd healthie
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Apply the SQL migrations in `supabase/migrations/` in order via the Supabase SQL editor or CLI (`supabase db push`).

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to Use

### Sign Up / Log In

1. Go to `/signup`, enter email, password, and select a role (Patient, Provider, or Admin).
2. You are redirected to your role-specific dashboard.
3. Returning users can log in at `/login`.

---

### Patient

- **Appointments** — Browse providers, pick an available slot, book a visit. Reschedule or cancel from the listing.
- **Medical Records** — View your clinical history and uploaded documents.
- **Prescriptions** — View active and past medications.
- **Messages** — Secure conversations with your provider.
- **Settings** — Update profile (name, phone, DOB, emergency contact, insurance, avatar) and change password.

---

### Provider

- **Availability** — Set your weekly schedule (day, start/end time, slot duration) so patients can book.
- **Patients** — View and manage your patient roster.
- **Appointments** — View your schedule and update appointment status.
- **Medical Records** — Create and manage patient records with document attachments.
- **Clinical Notes** — Write SOAP notes and link them to appointments.
- **Prescriptions** — Issue and manage prescriptions (medication, dosage, frequency, dates).
- **Messages** — Secure conversations with patients.
- **Analytics** — Operational metrics.
- **Settings** — Update profile (name, specialty, license number, bio, avatar) and change password.

---

### Admin

- **Patients / Providers** — Full CRUD: create accounts (email + password + profile), edit, or delete.
- **Appointments** — Oversee and manage all appointments across the platform.
- **Records / Notes / Prescriptions / Messages** — View, create, edit, and delete entries across all users.
- **Analytics** — Platform-wide business intelligence.
- **Profile** — Update admin name, avatar, and change password.
- **Settings** — Platform stats and full audit trail (every action logged with actor, entity, and timestamp).

---

## Verification Steps

Follow these steps in order to verify the full workflow across all roles.

### 1. Setup

1. Complete the [Getting Started](#getting-started) steps above.
2. Confirm the app loads at `http://localhost:3000`.

### 2. Admin

1. Sign up at `/signup` with role **Admin**.
2. Go to **Providers** → create a new provider account.
3. Go to **Patients** → create a new patient account.
4. Go to **Profile** → update your name and change your password.
5. Go to **Settings** → confirm platform stats show the created users and the audit trail logs your actions.

### 3. Provider

1. Log out and log in with the **provider** account created above.
2. Go to **Settings** → set up weekly availability (at least one day with time slots).
3. Go to **Medical Records** → create a record for the patient.
4. Go to **Clinical Notes** → create a SOAP note for the patient.
5. Go to **Prescriptions** → issue a prescription for the patient.
6. Go to **Messages** → send a message to the patient.
7. Update your profile and change your password from **Settings**.

### 4. Patient

1. Log out and log in with the **patient** account created above.
2. Go to **Appointments** → book an appointment with the provider (should see available slots).
3. Reschedule or cancel the appointment from the listing.
4. Go to **Medical Records** → confirm the record created by the provider is visible.
5. Go to **Prescriptions** → confirm the prescription is visible.
6. Go to **Messages** → reply to the provider's message.
7. Update your profile and change your password from **Settings**.

### 5. Admin — Final Check

1. Log back in as **Admin**.
2. Go to **Appointments** → confirm the patient's appointment appears.
3. Go to **Records / Notes / Prescriptions / Messages** → confirm all entries from above are visible.
4. Go to **Settings** → verify the audit trail captured every action across all roles.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Tech Stack

Next.js 14 (App Router) | Supabase (PostgreSQL + Auth) | TailwindCSS | TypeScript | Zod | Lucide React
