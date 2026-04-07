import { supabase } from './supabase';

export interface CustomTheme {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateThemeData {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Get all themes for the current user
export async function getUserThemes(): Promise<CustomTheme[]> {
  const { data, error } = await supabase
    .from('custom_themes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching themes:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// Get active theme for the current user
export async function getActiveTheme(): Promise<CustomTheme | null> {
  const { data, error } = await supabase
    .from('custom_themes')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active theme:', error);
    return null;
  }

  return data;
}

// Create a new theme
export async function createTheme(themeData: CreateThemeData): Promise<CustomTheme | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('custom_themes')
    .insert({
      user_id: user.id,
      name: themeData.name,
      colors: themeData.colors,
      is_active: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating theme:', error);
    return null;
  }

  return data;
}

// Update a theme
export async function updateTheme(
  themeId: string,
  updates: Partial<CreateThemeData>
): Promise<CustomTheme | null> {
  const { data, error } = await supabase
    .from('custom_themes')
    .update(updates)
    .eq('id', themeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating theme:', error);
    return null;
  }

  return data;
}

// Delete a theme
export async function deleteTheme(themeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('custom_themes')
    .delete()
    .eq('id', themeId);

  if (error) {
    console.error('Error deleting theme:', error);
    return false;
  }

  return true;
}

// Set a theme as active (deactivates all other themes)
export async function setActiveTheme(themeId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('User not authenticated');
    return false;
  }

  // First, deactivate all themes for this user
  const { error: deactivateError } = await supabase
    .from('custom_themes')
    .update({ is_active: false })
    .eq('user_id', user.id);

  if (deactivateError) {
    console.error('Error deactivating themes:', deactivateError);
    return false;
  }

  // Then activate the selected theme
  const { error: activateError } = await supabase
    .from('custom_themes')
    .update({ is_active: true })
    .eq('id', themeId);

  if (activateError) {
    console.error('Error activating theme:', activateError);
    return false;
  }

  return true;
}

// Deactivate all themes (return to default theme)
export async function deactivateAllThemes(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('User not authenticated');
    return false;
  }

  const { error } = await supabase
    .from('custom_themes')
    .update({ is_active: false })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deactivating themes:', error);
    return false;
  }

  return true;
}
