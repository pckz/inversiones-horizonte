INSERT INTO "settings" ("key", "value", "updated_at") VALUES
  ('calendly_url', 'https://calendly.com/pckz/agenda', NOW())
ON CONFLICT ("key") DO NOTHING;
