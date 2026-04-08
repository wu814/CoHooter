-- ============================================================
-- CoHooter — Supabase Schema
-- Run this entire script in the Supabase SQL Editor (one shot).
-- ============================================================

-- 1. Tables ------------------------------------------------

CREATE TABLE game_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin              text UNIQUE NOT NULL,
  host_id          text,
  status           text NOT NULL DEFAULT 'lobby',
  current_question jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  started_at       timestamptz,
  ended_at         timestamptz
);

-- Enable Realtime for live question sync
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;

CREATE TABLE players (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  nickname            text NOT NULL,
  score               integer NOT NULL DEFAULT 0,
  questions_completed integer NOT NULL DEFAULT 0,
  joined_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE submissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id      uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  question_title text,
  code           text,
  passed         boolean NOT NULL DEFAULT false,
  score          integer NOT NULL DEFAULT 0,
  time_seconds   integer,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- 2. Row-Level Security ------------------------------------

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players       ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions   ENABLE ROW LEVEL SECURITY;

-- game_sessions
CREATE POLICY "Anyone can read sessions"
  ON game_sessions FOR SELECT USING (true);

CREATE POLICY "Anyone can create sessions"
  ON game_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON game_sessions FOR UPDATE USING (true);

-- players
CREATE POLICY "Anyone can read players"
  ON players FOR SELECT USING (true);

CREATE POLICY "Anyone can join as player"
  ON players FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update players"
  ON players FOR UPDATE USING (true);

-- submissions
CREATE POLICY "Anyone can read submissions"
  ON submissions FOR SELECT USING (true);

CREATE POLICY "Anyone can create submissions"
  ON submissions FOR INSERT WITH CHECK (true);
