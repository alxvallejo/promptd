import { supabase } from './supabase'

export const setupPicksTable = async () => {
  try {
    // Check if picks table exists by trying to select from it
    const { error: checkError } = await supabase
      .from('picks')
      .select('id')
      .limit(1)

    if (checkError && checkError.message.includes('relation "public.picks" does not exist')) {
      console.log('Picks table does not exist. Creating it...')
      
      // Create the picks table
      const { error: createError } = await supabase.rpc('create_picks_table')
      
      if (createError) {
        console.error('Error creating picks table:', createError)
        // If RPC doesn't work, we'll need to create the table manually in Supabase
        throw new Error('Please run the SQL schema in your Supabase dashboard to create the picks table')
      }
      
      console.log('Picks table created successfully')
    } else if (checkError) {
      console.error('Error checking picks table:', checkError)
    } else {
      console.log('Picks table already exists')
    }
  } catch (error) {
    console.error('Error setting up picks table:', error)
    throw error
  }
}

// SQL to create picks table (to be run in Supabase SQL editor if needed)
export const PICKS_TABLE_SQL = `
-- Create picks table
CREATE TABLE IF NOT EXISTS picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('movies', 'tv', 'games', 'activities', 'other')),
  content TEXT NOT NULL,
  link_previews JSONB DEFAULT '[]'::jsonb,
  week_of TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX IF NOT EXISTS picks_user_id_idx ON picks(user_id);
CREATE INDEX IF NOT EXISTS picks_category_idx ON picks(category);
CREATE INDEX IF NOT EXISTS picks_week_of_idx ON picks(week_of);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_picks_updated_at BEFORE UPDATE ON picks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
` 