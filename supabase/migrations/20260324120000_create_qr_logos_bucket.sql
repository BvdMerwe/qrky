SET ROLE postgres;

-- Create qr-logos storage bucket for user-uploaded QR code logos
-- Public bucket so logos can be accessed without authentication

INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES (
    'qr-logos',
    'qr-logos',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET public = true;

-- RLS is enabled on storage.objects by default
-- Allow public read access to all objects in qr-logos bucket
DROP POLICY IF EXISTS "Public read access to qr-logos" ON storage.objects;
CREATE POLICY "Public read access to qr-logos" ON storage.objects
FOR SELECT USING (bucket_id = 'qr-logos');

-- Allow authenticated users to upload to their own folder (qr-logos/{user_id}/*)
DROP POLICY IF EXISTS "Users can upload to own qr-logos folder" ON storage.objects;
CREATE POLICY "Users can upload to own qr-logos folder" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'qr-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
DROP POLICY IF EXISTS "Users can manage own qr-logos" ON storage.objects;
CREATE POLICY "Users can manage own qr-logos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'qr-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
DROP POLICY IF EXISTS "Users can update own qr-logos" ON storage.objects;
CREATE POLICY "Users can update own qr-logos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'qr-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
RESET ROLE;
