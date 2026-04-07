import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/db/supabase';

interface VerificationForm {
  code: string;
}

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as { email?: string })?.email || '';
  const isSignup = (location.state as { isSignup?: boolean })?.isSignup || false;

  const form = useForm<VerificationForm>({
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (!email) {
      toast.error('Email not provided. Please start from signup.');
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleVerify = async (data: VerificationForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: data.code,
        type: 'email',
      });

      if (error) throw error;

      toast.success('Email verified successfully!');
      
      // Redirect to login page after successful verification
      navigate('/login', { state: { email, verified: true } });
    } catch (error: any) {
      toast.error(error.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      // Resend verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      toast.success('Verification code resent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/signup">
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <span>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Signup
                </span>
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification code to <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                rules={{
                  required: 'Verification code is required',
                  minLength: { value: 6, message: 'Code must be 6 digits' },
                  maxLength: { value: 6, message: 'Code must be 6 digits' },
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: 'Code must be 6 digits',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        disabled={loading}
                        className="text-center text-2xl tracking-widest font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend Code'
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Check your spam folder if you don't see the email</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
