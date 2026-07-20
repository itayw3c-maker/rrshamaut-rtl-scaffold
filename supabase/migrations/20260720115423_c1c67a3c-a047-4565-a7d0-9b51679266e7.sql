-- Roles enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'editor');
  end if;
end$$;

-- user_roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

-- has_role
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

create or replace function public.current_user_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin');
$$;
revoke all on function public.current_user_is_admin() from public, anon;
grant execute on function public.current_user_is_admin() to authenticated;

-- categories & tags
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  wp_id integer unique,
  slug text not null unique,
  name text not null,
  description text,
  is_spam boolean not null default false
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  wp_id integer unique,
  slug text not null unique,
  name text not null
);
grant select on public.tags to anon, authenticated;
grant insert, update, delete on public.tags to authenticated;
grant all on public.tags to service_role;

-- media
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  wp_id integer unique,
  legacy_url text,
  url text not null,
  bucket text not null default 'media',
  filename text,
  width integer,
  height integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists media_legacy_url_idx on public.media (legacy_url);
grant select on public.media to anon, authenticated;
grant insert, update, delete on public.media to authenticated;
grant all on public.media to service_role;

-- posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  wp_id integer unique,
  slug text not null unique,
  title text not null,
  content text not null default '',
  excerpt text,
  author_name text not null default 'רפאל שמאות רכוש',
  cover_media_id uuid references public.media (id) on delete set null,
  cpt_type text,
  video_url text,
  status text not null default 'publish',
  is_spam boolean not null default false,
  meta_title text,
  meta_description text,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists posts_published_idx on public.posts (published_at desc);
create index if not exists posts_is_spam_idx on public.posts (is_spam);
create index if not exists posts_cpt_type_idx on public.posts (cpt_type);
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;

create table if not exists public.post_categories (
  post_id uuid not null references public.posts (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  is_primary boolean not null default false,
  primary key (post_id, category_id)
);
create index if not exists post_categories_category_idx on public.post_categories (category_id);
create unique index if not exists post_categories_one_primary_per_post on public.post_categories (post_id) where is_primary;
grant select on public.post_categories to anon, authenticated;
grant insert, update, delete on public.post_categories to authenticated;
grant all on public.post_categories to service_role;

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  wp_id integer unique,
  slug text not null unique,
  title text not null,
  content text not null default '',
  cover_media_id uuid references public.media (id) on delete set null,
  status text not null default 'publish',
  meta_title text,
  meta_description text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select on public.pages to anon, authenticated;
grant insert, update, delete on public.pages to authenticated;
grant all on public.pages to service_role;

create table if not exists public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);
grant select on public.post_tags to anon, authenticated;
grant insert, update, delete on public.post_tags to authenticated;
grant all on public.post_tags to service_role;

-- leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  message text,
  source_url text,
  source_variant text,
  agreed boolean not null default false,
  agreed_at timestamptz,
  consent_text_version text,
  ip_hash text,
  user_agent text,
  webhook_ok boolean,
  webhook_response jsonb,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists leads_created_idx on public.leads (created_at desc);
grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;

create table if not exists public.webhook_config (
  id integer primary key default 1,
  webhook_url text,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint webhook_singleton check (id = 1)
);
grant select, insert, update, delete on public.webhook_config to authenticated;
grant all on public.webhook_config to service_role;

-- redirects
create table if not exists public.redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique,
  to_path text not null,
  status integer not null default 301,
  created_at timestamptz not null default now()
);
create index if not exists redirects_from_idx on public.redirects (from_path);
grant select on public.redirects to anon, authenticated;
grant insert, update, delete on public.redirects to authenticated;
grant all on public.redirects to service_role;

-- RLS
alter table public.posts enable row level security;
alter table public.pages enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.post_categories enable row level security;
alter table public.media enable row level security;
alter table public.user_roles enable row level security;
alter table public.leads enable row level security;
alter table public.webhook_config enable row level security;
alter table public.redirects enable row level security;

drop policy if exists "public read published posts" on public.posts;
create policy "public read published posts" on public.posts for select using (status = 'publish');
drop policy if exists "public read published pages" on public.pages;
create policy "public read published pages" on public.pages for select using (status = 'publish');
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "public read tags" on public.tags;
create policy "public read tags" on public.tags for select using (true);
drop policy if exists "public read post_tags" on public.post_tags;
create policy "public read post_tags" on public.post_tags for select using (true);
drop policy if exists "public read post_categories" on public.post_categories;
create policy "public read post_categories" on public.post_categories for select using (true);
drop policy if exists "public read media" on public.media;
create policy "public read media" on public.media for select using (true);
drop policy if exists "public read redirects" on public.redirects;
create policy "public read redirects" on public.redirects for select using (true);

drop policy if exists "staff write posts" on public.posts;
create policy "staff write posts" on public.posts for all
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
drop policy if exists "staff write pages" on public.pages;
create policy "staff write pages" on public.pages for all
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
drop policy if exists "staff write categories" on public.categories;
create policy "staff write categories" on public.categories for all
  using (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'))
  with check (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'));
drop policy if exists "staff write tags" on public.tags;
create policy "staff write tags" on public.tags for all
  using (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'))
  with check (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'));
drop policy if exists "staff write post_tags" on public.post_tags;
create policy "staff write post_tags" on public.post_tags for all
  using (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'))
  with check (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'));
drop policy if exists "staff write post_categories" on public.post_categories;
create policy "staff write post_categories" on public.post_categories for all
  using (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'))
  with check (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'));
drop policy if exists "staff write media" on public.media;
create policy "staff write media" on public.media for all
  using (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'))
  with check (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'));

drop policy if exists "admin write redirects" on public.redirects;
create policy "admin write redirects" on public.redirects for all
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());
drop policy if exists "admin manage roles" on public.user_roles;
create policy "admin manage roles" on public.user_roles for all
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());
drop policy if exists "user reads own roles" on public.user_roles;
create policy "user reads own roles" on public.user_roles for select using (auth.uid() = user_id);
drop policy if exists "admin manage webhook" on public.webhook_config;
create policy "admin manage webhook" on public.webhook_config for all
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "public insert leads" on public.leads;
create policy "public insert leads" on public.leads for insert with check (true);
drop policy if exists "admin read leads" on public.leads;
create policy "admin read leads" on public.leads for select using (public.current_user_is_admin());
drop policy if exists "admin update leads" on public.leads;
create policy "admin update leads" on public.leads for update
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

-- Storage object policies (the bucket itself is created via the storage tool)
drop policy if exists "public read media bucket" on storage.objects;
create policy "public read media bucket" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "staff write media bucket" on storage.objects;
create policy "staff write media bucket" on storage.objects for insert with check (
  bucket_id = 'media' and (public.current_user_is_admin() or public.has_role(auth.uid(),'editor'))
);
