# Welcome-To-Albania

Create a `.env` file in the project root and add:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
NEWSLETTER_ENCRYPTION_KEY=replace_with_a_long_random_secret
ADMIN_DASHBOARD_TOKEN=choose_a_strong_private_token
```

Then run:

```bash
npm run dev:client
```

Auth routes:

- `/sign-in`
- `/sign-up`

Admin route:

- `/admin/newsletter`

## Supabase comments table

Run this SQL in Supabase SQL editor:

```sql
create table if not exists public.city_comments (
  id uuid primary key default gen_random_uuid(),
  city_id text not null,
  author_email text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.city_comments enable row level security;

create policy "public can read comments"
on public.city_comments
for select
using (true);

create policy "authenticated can insert comments"
on public.city_comments
for insert
to authenticated
with check (auth.email() = author_email);
```

## Optional profiles table (user type)

If you want to persist roles (`native`, `tourist`, `visitor`) in a table:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  user_type text not null check (user_type in ('native', 'tourist', 'visitor')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id);
```
