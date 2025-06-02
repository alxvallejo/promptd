# Supabase Storage Setup for Image Uploads

The image upload feature for the Activities category uses Supabase Storage. This is now configured automatically through the Supabase CLI.

## Automatic Setup (Recommended)

The storage bucket and policies are automatically configured when you deploy the project:

### For Local Development

1. **Start the local Supabase instance**:
   ```bash
   supabase start
   ```

2. **Apply the migrations** (if not automatically applied):
   ```bash
   supabase db reset
   ```

The `images` bucket and all necessary RLS policies will be created automatically.

### For Production Deployment

1. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. **Push the configuration and migrations**:
   ```bash
   supabase db push
   ```

## Configuration Details

### Bucket Configuration
The `images` bucket is configured in `supabase/config.toml` with:
- **Public access**: Enabled for image serving
- **File size limit**: 10MB maximum
- **Allowed types**: PNG, JPEG, GIF, WebP
- **Path structure**: `picks/{user_id}/{filename}`

### Security Policies
The following RLS policies are automatically created:

1. **Public Read**: Anyone can view images
2. **Authenticated Upload**: Users can upload to their own folder
3. **Owner Update**: Users can update their own images
4. **Owner Delete**: Users can delete their own images

## Manual Setup (Alternative)

If you prefer to set up the bucket manually through the Supabase dashboard:

1. **Go to your Supabase dashboard** → Storage
2. **Create bucket**: Name it `images`, set to Public
3. **Add policies**: Copy the policies from `supabase/migrations/20250602222425_storage_bucket_policies.sql`

## File Organization

Images are stored with this structure:
```
images/
  picks/
    {user_id}/
      {timestamp}-{random}.{ext}
```

## Features

- **Drag & Drop**: Users can drag images directly onto the Activities category
- **File Validation**: Only image files up to 10MB are accepted
- **Error Handling**: Clear error messages for invalid files
- **Preview**: Immediate preview of uploaded images
- **Security**: Users can only upload/delete their own images
- **Version Control**: All configuration is in code and version controlled 