-- Update the images bucket file size limit to 2MB
UPDATE storage.buckets 
SET file_size_limit = 2097152  -- 2MB in bytes (2 * 1024 * 1024)
WHERE id = 'images';
