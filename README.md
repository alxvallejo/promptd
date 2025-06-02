# Prompt.d

A beautiful prompt journal application with ChatGPT-like interface, built with React, TypeScript, and Supabase.

![Prompt.d Screenshot](https://via.placeholder.com/800x400/6366f1/ffffff?text=Prompt.d+Screenshot)

## ✨ Features

- 🔐 **Google Authentication** - Secure login via Google OAuth
- 👤 **User Profiles** - Automatic profile creation with first names from Google OAuth
- 🌟 **Weekly Picks** - Share and discover community recommendations
- 🗑️ **Pick Management** - Edit and delete your own picks
- 📸 **Image Upload** - Drag & drop image sharing for Activities (Supabase Storage)
- 🔗 **Link Previews** - Rich previews when pasting URLs (IMDB, YouTube, etc.)
- 🌙 **Dark Mode** - Beautiful dark/light theme toggle
- 🎨 **Modern Fonts** - Choose from 4 professional font families
- 📁 **Folder Organization** - Create folders to organize your prompts
- 💬 **Chat Interface** - ChatGPT-like interface for prompt interaction
- 🎭 **Soft Colors** - Opaque color palette that's easy on the eyes
- 📱 **Responsive Design** - Works perfectly on desktop and mobile

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Authentication**: Google OAuth via Supabase Auth
- **Build Tool**: Vite
- **Icons**: Lucide React

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- A Supabase account

### 1. Clone the repository
```bash
git clone https://github.com/alxvallejo/prompt-d.git
cd prompt-d
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In your Supabase dashboard, go to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the query to create tables and policies

**Note**: The schema now includes a `profiles` table that automatically extracts user first names from Google OAuth metadata. This fixes the issue where picks showed "Anonymous User" instead of actual names.

### 4. Configure authentication

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google provider and add your OAuth credentials
3. Set the redirect URL to: `http://localhost:5173` (for development)

### 5. Environment setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Optional**: Add your OMDB API key for IMDB integration in `.env`:
   ```env
   VITE_OMDB_API_KEY=your_omdb_api_key_here
   ```
   
   Get a free API key at [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx). If not provided, the app will use a default key with limited usage.

### 6. Set up Supabase Storage (for image uploads)

**Note**: The Activities image upload feature uses Supabase Storage. The storage bucket and policies are automatically configured through the Supabase CLI when you run the project locally or deploy it.

**Quick Setup** (run this once):
```bash
./scripts/setup-storage.sh
```

**Manual Setup**:
- For local development: `supabase start`
- For production: `supabase link --project-ref YOUR_REF && supabase db push`

See `STORAGE_SETUP.md` for detailed information.

### 7. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🎨 Customization

### Colors
The app uses a soft, opaque color palette built with Tailwind CSS. Colors can be customized in `tailwind.config.js`.

### Fonts
Available font families:
- **Inter** - Clean, modern sans-serif
- **Poppins** - Friendly, rounded sans-serif  
- **Space Grotesk** - Quirky, technical sans-serif
- **DM Sans** - Geometric, professional sans-serif

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth.tsx          # Google authentication
│   ├── Sidebar.tsx       # Navigation and folders
│   ├── ChatInterface.tsx # Chat UI
│   ├── Picks.tsx         # Weekly picks interface
│   └── WeeklyPicks.tsx   # Community picks display
├── context/
│   ├── AuthContext.tsx   # User authentication
│   └── ThemeContext.tsx  # Dark mode & fonts
├── lib/
│   ├── supabase.ts       # Database client
│   ├── setupDatabase.ts  # Database setup utilities
│   ├── imdbSearch.ts     # IMDB/OMDB API integration
│   ├── linkPreview.ts    # General URL link preview functionality
│   └── imageUpload.ts    # Image upload to Supabase Storage
└── index.css             # Custom styles
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data (except picks which are public for viewing)
- Users can only delete their own picks (enforced at database level)
- Google OAuth for secure authentication
- Environment variables for sensitive data
- Automatic user profile creation with data extraction from OAuth metadata
- Secure image storage with user-based access control

## 📸 Image Upload (Activities)

The Activities category supports drag & drop image uploads with the following features:

- **Drag & Drop Interface**: Simply drag images onto the Activities category interface
- **File Validation**: Only accepts image files (PNG, JPG, GIF, etc.) up to 10MB each
- **Secure Storage**: Images are stored in Supabase Storage with user-based access control
- **Rich Previews**: Uploaded images appear as rich previews with file information
- **Error Handling**: Clear error messages for invalid files or upload failures

### Usage
1. Select the "Activities" category
2. Drag image files onto the interface or click to browse
3. Images are automatically uploaded and appear as previews
4. Submit your pick with text and/or images

## 🔗 Link Previews

The app automatically generates rich previews when you paste URLs:

### IMDB Links
- Paste any IMDB movie or TV show URL: `https://www.imdb.com/title/tt3896198/`
- Automatically fetches movie details using OMDB API
- Shows movie poster, ratings, plot, and year
- Works with any IMDB URL format
- URL is automatically replaced with the movie/TV show title for cleaner text

### YouTube Videos
- Paste YouTube video URLs: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Shows video title, channel name, and thumbnail
- Works with youtu.be short links and embed URLs

### Other URLs
- Generates basic previews for any website
- Shows domain name and creates placeholder imagery
- Supports Netflix, Steam, and other popular platforms

### Example Usage
```
Check out this amazing movie: https://www.imdb.com/title/tt0111161/
Great tutorial: https://www.youtube.com/watch?v=abc123
```

The app will automatically detect these URLs, show rich previews with images, titles, and descriptions, and replace IMDB URLs with clean movie titles.

## 🆕 Recent Updates

### Image Upload for Activities
- Added drag & drop image upload functionality for Activities category
- Secure image storage using Supabase Storage
- File validation and error handling
- Rich image previews with metadata
- User-based access control and RLS policies

### Link Preview Functionality
- Added real link preview generation when pasting URLs
- Special IMDB URL handling with rich movie/TV data via OMDB API
- YouTube video preview with title, channel, and thumbnail
- General URL preview support for any website
- Automatic URL detection and preview generation
- IMDB URLs are automatically replaced with movie titles for cleaner text

### Pick Management
- Added delete functionality for picks - users can now delete their own picks
- Delete buttons appear only for picks belonging to the current user
- Confirmation dialog prevents accidental deletions
- Immediate UI updates for better user experience

### User Profiles & First Names
- Added automatic user profile creation when users sign up with Google OAuth
- User first names are now extracted from Google profile data and displayed instead of "Anonymous User"
- The sidebar now shows the user's first name instead of their email address
- Existing users will have their profiles populated automatically when the new schema is applied

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com) for backend infrastructure
- UI components styled with [Tailwind CSS](https://tailwindcss.com)
- Icons from [Lucide](https://lucide.dev)
- Fonts from [Google Fonts](https://fonts.google.com)

---

Made with ❤️ by [Alex Vallejo](https://github.com/alxvallejo)