-- Asymmetric Bridge: Signal Tracker Schema
-- Migration 001: Create all tables

-- Signal statuses (current state of each signal)
create table signal_statuses (
  id uuid primary key default gen_random_uuid(),
  domino_id int not null,
  signal_name text not null,
  status text not null check (status in ('green', 'amber', 'red')),
  notes text,
  is_override boolean default false,
  updated_at timestamptz default now(),
  updated_by text default 'system',
  unique(domino_id, signal_name)
);

-- Signal data points (specific measurements over time)
create table signal_data_points (
  id uuid primary key default gen_random_uuid(),
  domino_id int not null,
  signal_name text not null,
  date text not null,
  value text not null,
  status text not null check (status in ('green', 'amber', 'red')),
  source text,
  created_at timestamptz default now()
);

-- Signal history (audit trail of all status changes)
create table signal_history (
  id uuid primary key default gen_random_uuid(),
  domino_id int not null,
  signal_name text not null,
  old_status text not null,
  new_status text not null,
  trigger_type text not null check (trigger_type in ('auto', 'manual', 'cron')),
  reason text,
  changed_at timestamptz default now()
);

-- Live data cache (external API responses)
create table live_data_cache (
  id uuid primary key default gen_random_uuid(),
  data_key text unique not null,
  data jsonb not null,
  fetched_at timestamptz default now(),
  ttl_minutes int default 60
);

-- Assessments (qualitative analysis from Claude Code)
create table assessments (
  id uuid primary key default gen_random_uuid(),
  section text unique not null,
  assessment text not null,
  confidence text check (confidence in ('HIGH', 'MEDIUM', 'LOW', 'UNVERIFIED')),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_signal_statuses_domino on signal_statuses(domino_id);
create index idx_signal_history_changed_at on signal_history(changed_at desc);
create index idx_signal_history_domino on signal_history(domino_id, signal_name);
create index idx_signal_data_points_domino on signal_data_points(domino_id, signal_name);
create index idx_live_data_cache_key on live_data_cache(data_key);
create index idx_live_data_cache_fetched on live_data_cache(fetched_at);
create index idx_assessments_section on assessments(section);
