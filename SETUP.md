# Prompt.d Setup Instructions

## Prerequisites
- Node.js 18+ installed
- A Supabase account

## 1. Supabase Setup

### Create a new Supabase project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created

### Set up authentication
1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google provider:
   - Toggle on Google
   - Add your Google OAuth credentials (Client ID and Secret)
   - Set the redirect URL to: `http://localhost:5173` (for development)

### Set up the database
1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the query to create tables and policies

## 2. Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your Supabase dashboard under Settings > API

## 3. Install Dependencies

```bash
npm install
```

## 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Features

- **Google Authentication**: Secure login via Google OAuth
- **Dark Mode**: Toggle between light and dark themes
- **Font Options**: Choose from 4 modern font families (Inter, Poppins, Space Grotesk, DM Sans)
- **Folder Organization**: Create folders to organize your prompts
- **Chat Interface**: ChatGPT-like interface for prompt interaction
- **Soft Colors**: Beautiful, opaque color palette that's easy on the eyes
- **Responsive Design**: Works on desktop and mobile devices

## Database Schema

### Tables
- `folders`: User-created folders for organizing prompts
- `prompts`: Individual prompt entries with title and content

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- All queries are automatically filtered by user ID

## Customization

### Colors
The app uses a custom color palette with soft, opaque colors. You can modify the colors in `tailwind.config.js`:
- `primary`: Main brand colors
- `surface`: Background and surface colors
- `dark.*`: Dark mode variants

### Fonts
Available font families can be modified in:
- `tailwind.config.js`: Add new font families
- `src/context/ThemeContext.tsx`: Update font options
- `src/index.css`: Import new Google Fonts