import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { resetPasswordForEmail } = useAuth();

  const form = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    try {
      const { error } = await resetPasswordForEmail(data.email);

      if (error) throw error;

      setUserEmail(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
            <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a password reset link to <span className="font-semibold text-foreground">{userEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-md p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Please click the reset link in your email to set a new password.
              </p>
              <p className="text-sm text-muted-foreground">
                The link will expire in 1 hour for security reasons.
              </p>
            </div>

            <Button
              asChild
              className="w-full"
            >
              <Link to="/login">
                Back to Login
              </Link>
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Didn't receive the email? Check your spam folder.</p>
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
          <div className="flex items-center gap-2 mb-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <span>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </span>
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                    <FormLabel>Email Address</FormLabel>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
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
