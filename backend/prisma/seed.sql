-- Idempotent seed for Neon (minimal data)
-- Admin user, profile, one business, membership

-- Users
INSERT INTO "users" ("id", "email", "password", "provider", "providerId", "emailVerified", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@bizpilot.local', '$2a$10$2ilARu3KfD.azraiYN71nuxXzIcJUrY/Svgbpyh4bdqFj9RJljaQ2', 'email', NULL, true, now(), now())
ON CONFLICT ("id") DO NOTHING;

-- User profile
INSERT INTO "user_profiles" ("id", "user_id", "email", "full_name", "avatar_url", "provider", "email_verified", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'admin@bizpilot.local', 'Admin User', NULL, 'email', true, now(), now())
ON CONFLICT ("id") DO NOTHING;

-- Business
INSERT INTO "businesses" ("id", "name", "description", "created_by", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-0000000000b1', 'Demo Business', 'Seeded demo business', '00000000-0000-0000-0000-000000000001', now(), now())
ON CONFLICT ("id") DO NOTHING;

-- Business membership (owner)
INSERT INTO "business_users" ("id", "business_id", "user_id", "role", "is_active", "invited_by", "invited_at", "accepted_at", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-00000000busr', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-000000000001', 'owner', true, NULL, now(), now(), now(), now())
ON CONFLICT ("business_id", "user_id") DO NOTHING;
