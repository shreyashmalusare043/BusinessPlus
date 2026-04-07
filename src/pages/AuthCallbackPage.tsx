import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

/**
 * This page handles the OAuth/confirmation callback from Supabase
 * It's called when user clicks the email confirmation link
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Check if user is authenticated with confirmed email
    if (user && user.email_confirmed_at) {
      toast.success('Email verified successfully!');
      navigate('/dashboard', { replace: true });
    } else if (user && !user.email_confirmed_at) {
      toast.error('Email not yet confirmed. Please check your email.');
      navigate('/login', { replace: true });
    } else {
      // No session found
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Processing your confirmation...</h1>
        <p className="text-muted-foreground">Verifying your email, please wait</p>
      </div>
    </div>
  );
}
