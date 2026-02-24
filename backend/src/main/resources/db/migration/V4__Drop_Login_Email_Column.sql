-- Drop login_email column from users table (no longer used, using email field instead)
ALTER TABLE users DROP COLUMN IF EXISTS login_email;
