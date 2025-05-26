-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add sample user (password: password123)
-- Note: In production, always use properly hashed passwords
INSERT INTO users (email, password) 
VALUES ('admin@example.com', '$2b$10$zGjfCcvdgPzZ3zj.JKzv0.taYfm7uJITFQpFHxlMjIu27FUXIgCFG')
ON CONFLICT (email) DO NOTHING;