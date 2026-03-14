# Deployment

## GitHub

1. Create a new GitHub repository.
2. Commit the project locally.
3. Add the GitHub remote.
4. Push the default branch.

Example commands:

```bash
git init
git add .
git commit -m "Initial MVP"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Vercel

1. Sign in to Vercel.
2. Import the GitHub repository.
3. Keep the framework preset as Next.js.
4. Add these environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
5. Set `NEXT_PUBLIC_APP_URL` to the deployed application URL.
6. Deploy.

## Post-deploy checks

1. Confirm signup redirects to `/login`.
2. Confirm login redirects each role to the correct portal.
3. Confirm patient appointment booking works.
4. Confirm video visit links open the protected `/visit/[id]` route.
5. Confirm provider records, SOAP notes, prescriptions, and messaging work.
6. Confirm notifications appear for new messages, prescriptions, and upcoming appointments.

## Supabase notes

- Apply all migrations before the first deployment.
- Ensure the `medical-documents` storage bucket exists.
- Ensure the service-role key is present in Vercel so server-side notifications, profile repair, and document operations can bypass RLS where required.
