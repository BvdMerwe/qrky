-- Fix conflicting RLS SELECT policies
-- Problem: Migration 20251115120000 added USING (true) SELECT policies that 
-- override the owner-scoped policies when combined with OR for authenticated users.
--
-- Solution: 
-- 1. Drop the conflicting public SELECT policies
-- 2. Create separate anon-role SELECT policies (only apply to anon role)
-- 3. Keep owner-scoped SELECT policies for authenticated role

-- Drop the conflicting public SELECT policies
DROP POLICY IF EXISTS "Public read access for url_objects" ON url_objects;
DROP POLICY IF EXISTS "Public read access for qr_codes" ON qr_codes;
DROP POLICY IF EXISTS "Public read access for aliases" ON aliases;

-- Create anon-role specific SELECT policies for redirect routes
-- These only apply when role = anon, so authenticated users are still scoped by owner policy

-- url_objects: Allow anon role to SELECT by identifier for URL redirects
-- This must be a separate policy for the anon role only
CREATE POLICY "Anon can read url_objects for redirects" ON url_objects 
FOR SELECT 
TO anon 
USING (true);

-- url_objects: Keep owner-scoped policy for authenticated users (from 20251106125016)
-- Already exists, but recreating for clarity
CREATE POLICY "Users can view their own url_objects" ON url_objects 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- qr_codes: Allow anon role to SELECT for QR display
CREATE POLICY "Anon can read qr_codes for display" ON qr_codes 
FOR SELECT 
TO anon 
USING (true);

-- qr_codes: Keep owner-scoped policy for authenticated users
CREATE POLICY "Users can view their own qr_codes" ON qr_codes 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = qr_codes.url_object_id AND url_objects.user_id = auth.uid())
);

-- aliases: Allow anon role to SELECT for URL redirects
CREATE POLICY "Anon can read aliases for redirects" ON aliases 
FOR SELECT 
TO anon 
USING (true);

-- aliases: Keep owner-scoped policy for authenticated users
CREATE POLICY "Users can view their own aliases" ON aliases 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (SELECT 1 FROM url_objects WHERE url_objects.id = aliases.url_object_id AND url_objects.user_id = auth.uid())
);
