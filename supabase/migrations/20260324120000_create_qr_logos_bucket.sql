-- Create qr-logos storage bucket for user-uploaded QR code logos
-- Public bucket so logos can be accessed without authentication

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
    'qr-logos',
    'qr-logos',
    true,
    524288, -- 500KB limit
    ARRAY['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'],
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- RLS is enabled on storage.objects by default
-- Allow public read access to all objects in qr-logos bucket
CREATE POLICY "Public read access to qr-logos" ON storage.objects
FOR SELECT USING (bucket_id = 'qr-logos');

-- Allow authenticated users to upload to their own folder (qr-logos/{user_id}/*)
CREATE POLICY "Users can upload to own qr-logos folder" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'qr-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update/delete their own files
CREATE POLICY "Users can manage own qr-logos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'qr-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own qr-logos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'qr-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
