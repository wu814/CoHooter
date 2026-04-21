-- ============================================================
-- Migration 001 — per-user RLS for game_sessions
-- Run in the Supabase SQL Editor.
-- ============================================================

-- Drop the old open-access policies for game_sessions
DROP POLICY IF EXISTS "Anyone can create sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON game_sessions;

-- Only authenticated users (admins) can create sessions, and only as themselves
CREATE POLICY "Authenticated users can create sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid()::text = host_id);

-- Only the session owner can update their session
CREATE POLICY "Owner can update session"
  ON game_sessions FOR UPDATE
  USING (auth.uid()::text = host_id);
