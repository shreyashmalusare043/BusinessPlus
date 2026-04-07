-- Create custom themes table
CREATE TABLE IF NOT EXISTS custom_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  colors JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_themes_user_id ON custom_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_themes_active ON custom_themes(user_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE custom_themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own themes
CREATE POLICY "Users can view own themes"
  ON custom_themes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own themes
CREATE POLICY "Users can create own themes"
  ON custom_themes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own themes
CREATE POLICY "Users can update own themes"
  ON custom_themes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own themes
CREATE POLICY "Users can delete own themes"
  ON custom_themes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_custom_themes_updated_at
  BEFORE UPDATE ON custom_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_themes_updated_at();