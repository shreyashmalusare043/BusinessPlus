import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { updatePassword } = useAuth();

  // Check if we have a valid reset token in the URL
  useEffect(() => {
    const checkResetToken = async () => {
      // Check for hash parameters (Supabase sends token in URL hash)
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && accessToken) {
        // Valid recovery token found
        setValidToken(true);
        toast.success('Reset link verified! Please enter your new password.');
      } else {
        // Check if user is already authenticated (came from forgot password flow)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setValidToken(true);
        } else {
          setValidToken(false);
          toast.error('Invalid or expired reset link. Please request a new one.');
        }
      }
    };

    checkResetToken();
  }, [location]);

  const form = useForm<ResetPasswordForm>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (data: ResetPasswordForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (data.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(data.password);

      if (error) throw error;

      setSuccess(true);
      toast.success('Password updated successfully!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 ">
                <img src="/images/logo/businesspluslogo.png" alt="BusinessPlus" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">BusinessPlus</h1>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4 mx-auto">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Password Updated!</CardTitle>
            <CardDescription className="text-center">
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-md p-4 space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                You can now login with your new password.
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting to login page...
              </p>
            </div>

            <Button
              asChild
              className="w-full"
            >
              <Link to="/login">
                Go to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if token is invalid
  if (validToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 ">
                <img src="/images/logo/businesspluslogo.png" alt="BusinessPlus" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">BusinessPlus</h1>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4 mx-auto">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-md p-4 space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Password reset links expire after 1 hour for security reasons.
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Please request a new password reset link.
              </p>
            </div>

            <Button
              asChild
              className="w-full"
            >
              <Link to="/forgot-password">
                Request New Reset Link
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full"
            >
              <Link to="/login">
                Back to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while checking token
  if (validToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 ">
              <img src="/images/logo/businesspluslogo.png" alt="BusinessPlus" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">BusinessPlus</h1>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
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
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: 'Please confirm your password',
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
