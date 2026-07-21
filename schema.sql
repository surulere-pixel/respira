CREATE TABLE IF NOT EXISTS open_floor_submissions (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL,
  phone TEXT, city TEXT, country TEXT, project_name TEXT, contribution_type TEXT NOT NULL,
  links TEXT, description TEXT, credit TEXT, rights_confirmed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'submitted'
);
CREATE TABLE IF NOT EXISTS directory_submissions (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, contact_name TEXT,
  email TEXT NOT NULL, phone TEXT, city TEXT, country TEXT, practice_type TEXT, ownership TEXT,
  website TEXT, booking_url TEXT, description TEXT, virtual INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'submitted'
);
CREATE TABLE IF NOT EXISTS room_requests (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, practice_name TEXT NOT NULL, contact_name TEXT,
  email TEXT NOT NULL, phone TEXT, city TEXT, country TEXT, practice_type TEXT,
  requested_domain TEXT, config TEXT, status TEXT NOT NULL DEFAULT 'submitted'
);
CREATE TABLE IF NOT EXISTS class_templates (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, intensity TEXT NOT NULL,
  disc TEXT NOT NULL, minutes INTEGER NOT NULL, blocks TEXT NOT NULL,
  author TEXT, email TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending'
);
-- radio albums + tracks: no-code admin panel (studio/admin.html "radio" tab),
-- files live in the respira-media R2 bucket, served at /media/<key>.
CREATE TABLE IF NOT EXISTS radio_albums (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, cover_key TEXT, cover_fallback TEXT,
  status TEXT NOT NULL DEFAULT 'coming_soon', sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS radio_tracks (
  id TEXT PRIMARY KEY, album_id TEXT NOT NULL, name TEXT NOT NULL, audio_key TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
);
