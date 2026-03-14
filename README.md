# Health Platform

A greenfield Next.js 14 + Supabase implementation of the development plan in `AI_DEVELOPMENT_PROMPT.md`.

## Implemented phases

- Phase 1: Next.js 14 app scaffold with TypeScript, App Router, TailwindCSS, ESLint, required folders, and standard repo ignore rules.
- Phase 2: Supabase browser/server/admin clients, shared client entrypoint, env template, CLI project config, and auth-aware middleware.
- Phase 3: Initial SQL migration for users, organizations, patients, providers, appointments, medical records, clinical notes, prescriptions, messages, notifications, and audit logs.
- Phase 4: Signup, login, logout, role-aware redirects, and protected patient/provider/admin portals.
- Phase 5: Patient routes for dashboard, appointments, records, prescriptions, messaging, and editable settings.
- Phase 6: Provider routes for dashboard, patients, appointments, SOAP notes, prescriptions, messaging, and editable settings.
- Phase 7: Appointment booking, availability management, rescheduling, cancellation, and status updates.
- Phase 8: MVP video consultation support through deterministic meeting-link generation and protected visit-room entry.
- Phase 9: EHR data model, medical-record authoring, and Supabase Storage-backed document handling.
- Phase 10: SOAP clinical note workflow, appointment attachment, and patient/provider note visibility.
- Phase 11: Prescription workflow and patient-facing prescription history.
- Phase 12: Messaging API, realtime message updates, and patient/provider conversation pickers.
- Phase 13: Notification records, live notification polling/realtime updates, and appointment reminder generation.
- Phase 14: RLS-oriented migrations, helper functions, role-scoped access, and audit-log writes.
- Phase 15: Medical blue/white Tailwind UI system, responsive dashboards, and non-placeholder admin screens.
- Phase 16: API routes for auth, patients, providers, appointments, records, prescriptions, messages, and notifications.
- Phase 17: Deployment documentation for GitHub and Vercel, including required environment variables.

## Required environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Database setup

Apply all SQL files in `supabase/migrations/` in timestamp order:

1. `20260314093000_initial_schema.sql`
2. `20260314134500_phase_7_9_12_support.sql`
3. `20260314142000_phase_4_5_6_profile_visibility.sql`
4. `20260314150000_phase_7_patient_appointment_updates.sql`

The `medical-documents` storage bucket is created by the migration stack.

## Local development

1. Install dependencies with `npm install`.
2. Configure `.env.local`.
3. Apply the Supabase migrations.
4. Install the Supabase CLI if you want local CLI workflows.
5. Run `npm run dev`.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the GitHub and Vercel deployment checklist.

## Notes

- The workspace started empty apart from the prompt file, so the project was scaffolded manually instead of using `create-next-app`.
- External operations such as dependency installation, Supabase project creation, GitHub push, and Vercel deployment are documented but not executed from this workspace.
- Notifications and audit-log inserts use the service-role client when available, which avoids RLS conflicts for server-side system events.
