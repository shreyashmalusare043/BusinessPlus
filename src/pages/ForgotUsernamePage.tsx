import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

interface ForgotUsernameForm {
  email: string;
}

export default function ForgotUsernamePage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  const emailForm = useForm<ForgotUsernameForm>({
    defaultValues: {
      email: '',
    },
  });

  const onEmailSubmit = async (data: ForgotUsernameForm) => {
    setLoading(true);
    try {
      // Query profiles table to check if email exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('email', data.email)
        .maybeSingle();

      if (error) throw error;

      if (!profile || !(profile as any).username) {
        toast.error('No account found with this email address');
        return;
      }

      setUsername((profile as any).username);
      toast.success('Username found!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to retrieve username');
    } finally {
      setLoading(false);
    }
  };

  if (username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Username Found!</CardTitle>
            <CardDescription>
              Here is your username associated with the email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your username is:</p>
                <p className="text-2xl font-bold text-primary">{username}</p>
              </AlertDescription>
            </Alert>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">Forgot Username</CardTitle>
          </div>
          <CardDescription>Enter your registered email to recover your username</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
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
                    <FormLabel>
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter your registered email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
