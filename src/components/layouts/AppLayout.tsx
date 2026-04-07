import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  ClipboardList,
  UserCircle,
  Truck,
  HelpCircle,
  FileCheck,
  Crown,
  Wallet,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: 'Customers', path: '/customers', icon: <UserCircle className="h-5 w-5" /> },
  { name: 'Suppliers', path: '/suppliers', icon: <Truck className="h-5 w-5" /> },
  { name: 'Work Orders', path: '/work-orders', icon: <Briefcase className="h-5 w-5" /> },
  { name: 'Bills', path: '/bills', icon: <FileText className="h-5 w-5" /> },
  { name: 'Purchase Orders', path: '/purchase-orders', icon: <ShoppingCart className="h-5 w-5" /> },
  { name: 'Expenses', path: '/expenses', icon: <Wallet className="h-5 w-5" /> },
  { name: 'Delivery Challan', path: '/delivery-challans', icon: <FileCheck className="h-5 w-5" /> },
  { name: 'Stock', path: '/stock', icon: <Package className="h-5 w-5" /> },
  { name: 'Work Tracking', path: '/work-tracking', icon: <ClipboardList className="h-5 w-5" /> },
  { name: 'Reports', path: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
  { name: 'User Management', path: '/users', icon: <Users className="h-5 w-5" />, adminOnly: true },
  { name: 'Subscriptions', path: '/admin/subscriptions', icon: <Crown className="h-5 w-5" />, adminOnly: true },
  { name: 'Help & Support', path: '/help', icon: <HelpCircle className="h-5 w-5" /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCompanySettings = () => {
    navigate('/company-setup');
    setMobileOpen(false);
  };

  const filteredNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6 gap-3">
        <div className="flex items-center justify-center w-10 h-10 ">
          <img src="/images/logo/businesspluslogo.png" alt="" />
        </div>
        <h1 className="text-lg font-bold text-sidebar-foreground">BusinessPlus</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleCompanySettings}
        >
          <Settings className="mr-2 h-4 w-4" />
          Company Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-sidebar-background border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar-background">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Upgrade Button - Only show for non-admin users on free plan */}
            {profile?.role !== 'admin' && profile?.subscription_plan === 'free' && (
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-lg"
                onClick={() => navigate('/subscription')}
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            )}
            
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{profile?.username || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'user'}</p>
            </div>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-background px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© 2026 BusinessPlus. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                Privacy Policy
              </a>
              <span>|</span>
              <a href="/terms-conditions" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                Terms & Conditions
              </a>
              <span>|</span>
              <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                Refund Policy
              </a>
              <span>|</span>
              <a href="/data-security-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                Data Security Policy
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
