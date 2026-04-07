import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SignupForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface LoginForm {
  email: string;
  password: string;
}

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const signupForm = useForm<SignupForm>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const loginForm = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignup = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!data.acceptTerms) {
      toast.error('Please accept the Terms & Conditions and Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUpWithEmail(data.username, data.email, data.password);

      if (error) throw error;

      toast.success('Account created! Please check your email to verify your account.');
      signupForm.reset();
      setActiveTab('login');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const { error } = await signInWithEmail(data.email, data.password);

      if (error) throw error;

      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Theme Toggle - Top Right - Always Visible */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Side - Theme-Aware Hero Section - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-primary/10 to-background dark:from-gray-900 dark:via-gray-800 dark:to-black p-8 lg:p-12 flex-col overflow-hidden relative">
        {/* Animated Glowing Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large Glow 1 - Top Right */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/30 dark:bg-primary/20 rounded-full blur-3xl animate-glow-pulse"></div>
          
          {/* Large Glow 2 - Bottom Left */}
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-primary/20 dark:bg-primary/15 rounded-full blur-3xl animate-glow-float" style={{ animationDelay: '2s' }}></div>
          
          {/* Medium Glow 3 - Center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/15 dark:bg-primary/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Small Glow 4 - Top Left */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/25 dark:bg-primary/15 rounded-full blur-2xl animate-glow-float" style={{ animationDelay: '3s' }}></div>
          
          {/* Small Glow 5 - Bottom Right */}
          <div className="absolute bottom-40 right-40 w-56 h-56 bg-primary/20 dark:bg-primary/10 rounded-full blur-2xl animate-glow-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Logo & Title - Top Center */}
        <div className="flex flex-col items-center justify-center mb-12 relative z-10">
          <div className="flex items-center justify-center w-20 h-20 ">
            <img src="public/images/logo/businesspluslogo.png" alt="" />
          </div>
          <h1 className="text-6xl font-bold mb-3">
            <span className="text-foreground">Business</span>
            <span className="text-primary">Plus</span>
          </h1>
          <p className="text-xl text-foreground/80 text-center mb-2">
            Complete Business Management Solution
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Streamline your billing, inventory, and operations with powerful tools designed for modern businesses
          </p>
        </div>

        {/* Animated Billing Elements */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="grid grid-cols-2 gap-6 max-w-xl">
            {/* Feature Card 1 - Billing */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-foreground font-semibold mb-2">Smart Billing</h3>
              <p className="text-muted-foreground text-sm">Create professional invoices with GST compliance</p>
            </div>

            {/* Feature Card 2 - Inventory */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-foreground font-semibold mb-2">Stock Control</h3>
              <p className="text-muted-foreground text-sm">Real-time inventory tracking and alerts</p>
            </div>

            {/* Feature Card 3 - Reports */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-foreground font-semibold mb-2">Analytics</h3>
              <p className="text-muted-foreground text-sm">Powerful insights and detailed reports</p>
            </div>

            {/* Feature Card 4 - Management */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-foreground font-semibold mb-2">Team Management</h3>
              <p className="text-muted-foreground text-sm">Multi-user access with role controls</p>
            </div>
          </div>
        </div>

        {/* CSS Animation Styles */}
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            25% {
              transform: translateY(-20px) rotate(2deg);
            }
            50% {
              transform: translateY(-10px) rotate(-2deg);
            }
            75% {
              transform: translateY(-15px) rotate(1deg);
            }
          }
          
          @keyframes glow-pulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.1);
            }
          }
          
          @keyframes glow-float {
            0%, 100% {
              transform: translate(0, 0);
              opacity: 0.2;
            }
            33% {
              transform: translate(30px, -30px);
              opacity: 0.4;
            }
            66% {
              transform: translate(-20px, 20px);
              opacity: 0.3;
            }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-glow-pulse {
            animation: glow-pulse 8s ease-in-out infinite;
          }
          
          .animate-glow-float {
            animation: glow-float 12s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center p-4 lg:p-8 relative">
        {/* Mobile Logo - Only visible on mobile */}
        <div className="lg:hidden absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <img src="public/images/logo/businesspluslogo.png" alt="" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-foreground">Business</span>
            <span className="text-primary">Plus</span>
          </h1>
        </div>

        <Card className="w-full max-w-md shadow-xl border-2 mt-20 lg:mt-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Create an account or login to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="john.doe@example.com"
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      rules={{
                        required: 'Password is required',
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="••••••••"
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between text-sm">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => navigate('/forgot-password')}
                      >
                        Forgot Password?
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => navigate('/forgot-email')}
                      >
                        Forgot Email?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="space-y-4">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="username"
                      rules={{
                        required: 'Username is required',
                        minLength: { value: 3, message: 'Username must be at least 3 characters' },
                        pattern: {
                          value: /^[a-zA-Z0-9_]+$/,
                          message: 'Username can only contain letters, numbers, and underscores',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="johndoe"
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="email"
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="john.doe@example.com"
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="password"
                      rules={{
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="••••••••"
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      rules={{
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === signupForm.getValues('password') || 'Passwords do not match',
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="••••••••"
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="acceptTerms"
                      rules={{
                        required: 'You must accept the Terms & Conditions and Privacy Policy',
                      }}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={loading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              I agree to the{' '}
                              <a
                                href="/terms-conditions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                              >
                                Terms & Conditions
                              </a>
                              {' '}and{' '}
                              <a
                                href="/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                              >
                                Privacy Policy
                              </a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
