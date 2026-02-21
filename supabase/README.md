# Supabase

This folder contains Supabase CLI config and migrations for the starter template.

## Setup

1. Install Supabase CLI: `npm i supabase --save-dev` or `brew install supabase/tap/supabase`
2. Link to your project: `supabase link --project-ref <your-project-ref>`
3. Push migrations: `supabase db push`

## Environment

Add to `.env` (or `.env.local`):

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

## Edge Functions (OrgAI / Lovable)

Included: `analyze-role`, `parse-org-image`, `analyze-org-role`. They use the Lovable AI Gateway.

1. Set secret in Supabase Dashboard → Project Settings → Edge Functions: `LOVABLE_API_KEY`.
2. Deploy: `supabase functions deploy analyze-role` (and same for `parse-org-image`, `analyze-org-role`).

Tables required: `analyses`, `org_charts`, `org_roles` (see migrations 00001–00004).
