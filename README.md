# Prompt.d

A beautiful prompt journal application with ChatGPT-like interface, built with React, TypeScript, and Supabase.

![Prompt.d Screenshot](https://via.placeholder.com/800x400/6366f1/ffffff?text=Prompt.d+Screenshot)

## ✨ Features

- 🔐 **Google Authentication** - Secure login via Google OAuth
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

### 6. Run the development server

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
│   └── ChatInterface.tsx # Chat UI
├── context/
│   ├── AuthContext.tsx   # User authentication
│   └── ThemeContext.tsx  # Dark mode & fonts
├── lib/
│   └── supabase.ts       # Database client
└── index.css             # Custom styles
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Google OAuth for secure authentication
- Environment variables for sensitive data

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