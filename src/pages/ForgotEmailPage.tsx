import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, HelpCircle, Phone, MessageCircle } from 'lucide-react';

export default function ForgotEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 ">
              <img src="public/images/logo/businesspluslogo.png" alt="BusinessPlus Logo" />
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
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Forgot Your Email?</CardTitle>
          <CardDescription className="text-center">
            We're here to help you recover your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-md p-4 space-y-3">
            <h3 className="font-semibold text-sm">Try these steps first:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Check your email accounts for confirmation emails from BusinessPlus</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Look for emails from noreply@businessplus.com or similar addresses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Check your spam or junk folder</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Try common email addresses you use (work, personal, etc.)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Still can't find your email?</h3>
            <p className="text-sm text-muted-foreground">
              Contact our support team and we'll help you recover your account. Please have the following information ready:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Your full name or username</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Company name (if applicable)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Any other account details you remember</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Contact Support:</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a href="mailto:support@businessplus.com">
                  <Mail className="mr-2 h-4 w-4" />
                  support@businessplus.com
                </a>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/help">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Visit Help Center
                </Link>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              asChild
              className="w-full"
            >
              <Link to="/login">
                Back to Login
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
