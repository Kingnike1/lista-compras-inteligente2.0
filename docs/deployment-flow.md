# Deployment flow

## Branches

- `main`: production on Vercel.
- `develop`: preview/staging validation on Vercel.
- short-lived feature branches: preview deployments when needed.

## Gate

Changes are validated in a Vercel Preview deployment from `develop` before merging into `main`.

Required public environment variables in both Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

OAuth application redirects are handled by `/auth/callback` and must be allow-listed in Supabase Auth URL Configuration for the corresponding deployment URLs.
