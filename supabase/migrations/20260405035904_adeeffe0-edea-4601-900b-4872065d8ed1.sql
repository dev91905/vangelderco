
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Anyone can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Anyone can update post images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'post-images');

CREATE POLICY "Anyone can delete post images"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-images');
