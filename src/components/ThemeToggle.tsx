import { Moon, Sun, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserThemes, setActiveTheme, deactivateAllThemes, CustomTheme } from '@/db/themes';
import { toast } from 'sonner';

export function ThemeToggle() {
  const { theme, toggleTheme, customTheme, setCustomTheme, applyCustomColors, clearCustomColors } = useTheme();
  const navigate = useNavigate();
  const [themes, setThemes] = useState<CustomTheme[]>([]);

  const loadThemes = async () => {
    const userThemes = await getUserThemes();
    setThemes(userThemes);
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const handleActivateTheme = async (themeToActivate: CustomTheme) => {
    const success = await setActiveTheme(themeToActivate.id);
    if (success) {
      toast.success(`Theme "${themeToActivate.name}" activated!`);
      setCustomTheme(themeToActivate);
      applyCustomColors(themeToActivate.colors);
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

  return (
    <div className="flex items-center gap-2">
      {/* Light/Dark Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="relative"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Theme Selector Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Select theme">
            <Palette className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Color Themes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Default Theme */}
          <DropdownMenuItem onClick={handleDeactivateTheme}>
            <div className="flex items-center justify-between w-full">
              <span>Default Theme</span>
              {!customTheme && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>

          {/* Custom Themes */}
          {themes.map((themeItem) => (
            <DropdownMenuItem key={themeItem.id} onClick={() => handleActivateTheme(themeItem)}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: themeItem.colors.primary }}
                    />
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: themeItem.colors.secondary }}
                    />
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: themeItem.colors.accent }}
                    />
                  </div>
                  <span>{themeItem.name}</span>
                </div>
                {themeItem.is_active && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/theme-editor')}>
            <Palette className="mr-2 h-4 w-4" />
            <span>Manage Themes</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

