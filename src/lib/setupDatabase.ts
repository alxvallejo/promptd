import { supabase } from './supabase'

export const setupPicksTable = async () => {
  try {
    // Check if profiles table exists
    const { error: profilesCheckError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    // Check if picks table exists
    const { error: picksCheckError } = await supabase
      .from('picks')
      .select('id')
      .limit(1)

    if (profilesCheckError && profilesCheckError.message.includes('relation "public.profiles" does not exist')) {
      console.log('Profiles table does not exist')
      throw new Error('Please run the SQL schema in your Supabase dashboard to create the profiles and picks tables')
    }

    if (picksCheckError && picksCheckError.message.includes('relation "public.picks" does not exist')) {
      console.log('Picks table does not exist')
      throw new Error('Please run the SQL schema in your Supabase dashboard to create the picks table')
    }

    if (profilesCheckError) {
      console.error('Error checking profiles table:', profilesCheckError)
    }

    if (picksCheckError) {
      console.error('Error checking picks table:', picksCheckError)
    }

    if (!profilesCheckError && !picksCheckError) {
      console.log('Database tables are set up correctly')
    }
  } catch (error) {
    console.error('Error setting up database:', error)
    throw error
  }
}

// SQL to create picks table (to be run in Supabase SQL editor if needed)
export const PICKS_TABLE_SQL = `
-- Create user profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create picks table
CREATE TABLE IF NOT EXISTS picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('movies', 'tv', 'movies-tv', 'games', 'activities', 'other')),
  content TEXT NOT NULL,
  link_previews JSONB DEFAULT '[]'::jsonb,
  week_of TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Create policies for picks
CREATE POLICY "Users can view all picks" ON picks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own picks" ON picks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own picks" ON picks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own picks" ON picks
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
CREATE INDEX IF NOT EXISTS picks_user_id_idx ON picks(user_id);
CREATE INDEX IF NOT EXISTS picks_category_idx ON picks(category);
CREATE INDEX IF NOT EXISTS picks_week_of_idx ON picks(week_of);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), NEW.raw_user_meta_data->>'first_name'),
    COALESCE(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 2), NEW.raw_user_meta_data->>'last_name'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'picture', NEW.raw_user_meta_data->>'avatar_url')
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_picks_updated_at BEFORE UPDATE ON picks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
` 