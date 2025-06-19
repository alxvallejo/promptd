#!/bin/bash

# Supabase Storage Setup Script for Prompt.d
# This script sets up the images storage bucket and policies

echo "🚀 Setting up Supabase Storage for Prompt.d..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   For more info: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Starting Supabase services..."
supabase start

echo "🗃️ Applying storage migrations..."
supabase db reset --force

echo "✅ Storage setup complete!"
echo ""
echo "📸 Your images bucket is now ready with:"
echo "   • Public read access for image serving"
echo "   • 10MB file size limit"
echo "   • Support for PNG, JPEG, GIF, WebP"
echo "   • Secure user-based upload/delete permissions"
echo ""
echo "🎉 You can now use the drag & drop image feature in the Activities category!"
echo ""
echo "💡 To deploy to production, run:"
echo "   supabase link --project-ref YOUR_PROJECT_REF"
echo "   supabase db push" 