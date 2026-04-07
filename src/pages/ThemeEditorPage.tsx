import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, Palette, Trash2, Check, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getUserThemes,
  createTheme,
  deleteTheme,
  setActiveTheme,
  deactivateAllThemes,
  CustomTheme,
} from '@/db/themes';

interface ThemeForm {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export default function ThemeEditorPage() {
  const [loading, setLoading] = useState(false);
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [previewColors, setPreviewColors] = useState<{ primary: string; secondary: string; accent: string } | null>(null);
  const navigate = useNavigate();
  const { customTheme, setCustomTheme, applyCustomColors, clearCustomColors } = useTheme();

  const form = useForm<ThemeForm>({
    defaultValues: {
      name: '',
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
    },
  });

  const loadThemes = async () => {
    const userThemes = await getUserThemes();
    setThemes(userThemes);
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const handleCreateTheme = async (data: ThemeForm) => {
    setLoading(true);
    try {
      const newTheme = await createTheme({
        name: data.name,
        colors: {
          primary: data.primary,
          secondary: data.secondary,
          accent: data.accent,
        },
      });

      if (newTheme) {
        toast.success('Theme created successfully!');
        form.reset();
        setPreviewColors(null);
        await loadThemes();
      } else {
        toast.error('Failed to create theme');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create theme');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) {
      return;
    }

    const success = await deleteTheme(themeId);
    if (success) {
      toast.success('Theme deleted successfully');
      await loadThemes();
      
      // If deleted theme was active, clear custom colors
      if (customTheme?.id === themeId) {
        setCustomTheme(null);
        clearCustomColors();
      }
    } else {
      toast.error('Failed to delete theme');
    }
  };

  const handleActivateTheme = async (theme: CustomTheme) => {
    const success = await setActiveTheme(theme.id);
    if (success) {
      toast.success(`Theme "${theme.name}" activated!`);
      setCustomTheme(theme);
      applyCustomColors(theme.colors);
      await loadThemes();
    } else {
      toast.error('Failed to activate theme');
    }
  };

  const handleDeactivateTheme = async () => {
    const success = await deactivateAllThemes();
    if (success) {
      toast.success('Returned to default theme');
      setCustomTheme(null);
      clearCustomColors();
      await loadThemes();
    } else {
      toast.error('Failed to deactivate theme');
    }
  };

  const handlePreview = () => {
    const values = form.getValues();
    setPreviewColors({
      primary: values.primary,
      secondary: values.secondary,
      accent: values.accent,
    });
    applyCustomColors({
      primary: values.primary,
      secondary: values.secondary,
      accent: values.accent,
    });
    toast.info('Preview applied! Save to keep this theme.');
  };

  const handleCancelPreview = () => {
    setPreviewColors(null);
    if (customTheme) {
      applyCustomColors(customTheme.colors);
    } else {
      clearCustomColors();
    }
    toast.info('Preview cancelled');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Theme Editor</h1>
          <p className="text-muted-foreground">Create and manage custom color themes</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Theme Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Create New Theme
            </CardTitle>
            <CardDescription>
              Choose your custom colors and create a personalized theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateTheme)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Theme name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Custom Theme" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="color" {...field} className="h-10 w-20" />
                        </FormControl>
                        <Input value={field.value} onChange={field.onChange} placeholder="#f97316" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="color" {...field} className="h-10 w-20" />
                        </FormControl>
                        <Input value={field.value} onChange={field.onChange} placeholder="#ea580c" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="color" {...field} className="h-10 w-20" />
                        </FormControl>
                        <Input value={field.value} onChange={field.onChange} placeholder="#fb923c" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handlePreview} className="flex-1">
                    Preview
                  </Button>
                  {previewColors && (
                    <Button type="button" variant="ghost" onClick={handleCancelPreview}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Theme'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Saved Themes */}
        <Card>
          <CardHeader>
            <CardTitle>Your Themes</CardTitle>
            <CardDescription>
              Manage your saved themes and switch between them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Default Theme Option */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: 'hsl(24, 95%, 53%)' }} />
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: 'hsl(20, 17%, 90%)' }} />
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: 'hsl(20, 17%, 93%)' }} />
                  </div>
                  <div>
                    <p className="font-medium">Default Theme</p>
                    <p className="text-sm text-muted-foreground">Original BusinessPlus colors</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!customTheme ? (
                    <Button size="sm" variant="default" disabled onClick={() => {}}>
                      <Check className="h-4 w-4 mr-1" />
                      Active
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={handleDeactivateTheme}>
                      Activate
                    </Button>
                  )}
                </div>
              </div>

              {themes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No custom themes yet</p>
                  <p className="text-sm">Create your first theme to get started</p>
                </div>
              ) : (
                themes.map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{theme.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(theme.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {theme.is_active ? (
                        <Button size="sm" variant="default" disabled onClick={() => {}}>
                          <Check className="h-4 w-4 mr-1" />
                          Active
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleActivateTheme(theme)}>
                          Activate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTheme(theme.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
          <CardDescription>
            See how your theme looks with different components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Primary</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => {}}>Primary Button</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secondary</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full" onClick={() => {}}>
                  Secondary Button
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-accent text-accent-foreground rounded-md text-center">
                  Accent Background
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
