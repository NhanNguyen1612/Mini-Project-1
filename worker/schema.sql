-- =============================================================
-- VKU Field Survey — Cloudflare D1 Database Schema
-- Database Name: vku-survey-db-v2
-- =============================================================

CREATE TABLE IF NOT EXISTS vku_surveys (
  uuid         TEXT PRIMARY KEY,
  building     TEXT    NOT NULL DEFAULT '',
  floor        TEXT    NOT NULL DEFAULT '',
  room_number  TEXT    NOT NULL DEFAULT '',
  category     TEXT    NOT NULL DEFAULT '',
  condition_rating INTEGER NOT NULL DEFAULT 3,
  defect_notes TEXT    NOT NULL DEFAULT '',
  photo_base64 TEXT    NOT NULL DEFAULT '',
  inspector_name TEXT  NOT NULL DEFAULT '',
  created_at   TEXT    NOT NULL,
  synced_at    TEXT    NOT NULL
);

-- Index for faster queries by date and building
CREATE INDEX IF NOT EXISTS idx_surveys_created  ON vku_surveys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_surveys_building ON vku_surveys(building);
CREATE INDEX IF NOT EXISTS idx_surveys_category ON vku_surveys(category);

-- =============================================================
-- Seed data for initial testing (optional, can remove in prod)
-- =============================================================
-- INSERT INTO vku_surveys VALUES (
--   'test-uuid-001', 'Khu B', 'Tầng 3', 'B302', 'Projector', 2,
--   'Máy chiếu bị vàng màu, bóng đèn gần hết tuổi thọ.', '',
--   'Admin VKU', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'
-- );
