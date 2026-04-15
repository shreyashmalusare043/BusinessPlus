import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

/**
 * This page handles the OAuth/confirmation callback from Supabase
 * Handles both email confirmation and password reset callbacks
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Check URL hash for callback type
    const hash = window.location.hash;
    const isPasswordReset = hash.includes('type=recovery') || hash.includes('type=password_recovery');

    if (isPasswordReset) {
      // Handle password reset callback
      if (user) {
        toast.success('Password reset link verified! Please set your new password.');
        navigate('/reset-password', { replace: true });
      } else {
        toast.error('Invalid password reset link. Please request a new one.');
        navigate('/forgot-password', { replace: true });
      }
      return;
    }

    // Handle email confirmation callback
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
        <h1 className="text-2xl font-bold mb-2">Processing your request...</h1>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    </div>
  );
}
