import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateTransactionStatus, activateSubscription } from '@/db/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = {
  free: {
    name: 'Free Plan',
    price: 0,
    period: 'Forever',
    features: [
      { name: 'Basic billing features', included: true },
      { name: 'Purchase orders', included: true },
      { name: 'Stock management', included: true },
      { name: 'Watermark on prints', included: false, isNegative: true },
      { name: 'Limited reports', included: false, isNegative: true },
      { name: 'Delivery challan', included: false, isNegative: true },
      { name: 'Payment email automation', included: false, isNegative: true },
      { name: 'Email support', included: false, isNegative: true },
    ],
  },
  monthly: {
    name: 'Monthly Plan',
    price: 499,
    period: 'per month',
    features: [
      { name: 'All billing features', included: true },
      { name: 'Purchase orders', included: true },
      { name: 'Stock management', included: true },
      { name: 'No watermark on prints', included: true },
      { name: 'Unlimited reports', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Delivery challan', included: true },
      { name: 'Payment email automation', included: true },
      { name: 'Work tracking', included: true },
    ],
  },
  yearly: {
    name: 'Yearly Plan',
    price: 5499,
    period: 'per year',
    savings: 489,
    features: [
      { name: 'All billing features', included: true },
      { name: 'Purchase orders', included: true },
      { name: 'Stock management', included: true },
      { name: 'No watermark on prints', included: true },
      { name: 'Unlimited reports', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Delivery challan', included: true },
      { name: 'Payment email automation', included: true },
      { name: 'Work tracking', included: true },
      { name: 'Save ₹489 per year', included: true, highlight: true },
    ],
  },
};

export default function SubscriptionPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [agreeToRefundPolicy, setAgreeToRefundPolicy] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    if (!profile) {
      toast.error('Please login to subscribe');
      return;
    }

    if (profile.role === 'admin') {
      toast.info('Admin accounts have full access by default');
      return;
    }

    if (!scriptLoaded) {
      toast.error('Payment system is loading. Please try again.');
      return;
    }

    // Show refund policy dialog
    setSelectedPlan(planType);
    setAgreeToRefundPolicy(false);
    setShowRefundDialog(true);
  };

  const proceedWithPayment = async () => {
    if (!agreeToRefundPolicy) {
      toast.error('Please agree to the Refund Policy');
      return;
    }

    if (!selectedPlan || !profile) return;

    setShowRefundDialog(false);
    setLoading(true);

    try {
      const amount = selectedPlan === 'monthly' ? 499 : 5499;

      console.log('🔄 Creating Razorpay order...');

      // Call local backend to create Razorpay order
      const backendUrl = import.meta.env.VITE_RAZORPAY_API_HOST || 'http://localhost:5000';
      
      const orderResponse = await fetch(`${backendUrl}/api/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          planType: selectedPlan,
        }),
      });

      console.log('Response status:', orderResponse.status);

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Backend error:', errorData);
        toast.error(`Failed to create payment order: ${errorData.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      const { order_id, key: razorpayKey } = await orderResponse.json();

      if (!order_id) {
        toast.error('Failed to get order ID from backend');
        setLoading(false);
        return;
      }

      console.log('✅ Order created:', order_id);

      // Razorpay options
      const options = {
        key: razorpayKey,
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'BusinessPlus',
        description: `${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
        order_id: order_id,
        handler: async function (response: any) {
          try {
            console.log('🔐 Verifying payment...');

            // Verify payment signature with backend
            const verifyResponse = await fetch(`${backendUrl}/api/razorpay/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            console.log('✅ Payment verified!');

            // Update transaction with payment details
            await updateTransactionStatus(order_id, 'success', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Activate subscription
            await activateSubscription(selectedPlan, order_id);

            toast.success('Subscription activated successfully!');
            navigate('/dashboard');
            window.location.reload();
          } catch (error) {
            console.error('❌ Activation error:', error);
            toast.error('Payment received but activation failed. Please contact support.');
          }
        },
        prefill: {
          name: profile.username,
          email: profile.email || '',
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: async function () {
            console.log('Payment cancelled');
            await updateTransactionStatus(order_id, 'failed');
            toast.error('Payment cancelled');
            setLoading(false);
          },
        },
      };

      if (!window.Razorpay) {
        toast.error('Razorpay script not loaded. Please refresh and try again.');
        setLoading(false);
        return;
      }

      console.log('🎯 Opening Razorpay checkout...');
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('❌ Subscription error:', error);
      toast.error(`Failed to initiate payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const currentPlan = profile.subscription_plan || 'free';
  const isAdmin = profile.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground mt-1">
            Choose the plan that works best for you
          </p>
        </div>
        {isAdmin && (
          <Badge variant="default" className="text-sm">
            <Crown className="mr-1 h-4 w-4" />
            Admin - Full Access
          </Badge>
        )}
      </div>

      {currentPlan !== 'free' && !isAdmin && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <p className="font-medium">
                You are currently on the <span className="text-primary capitalize">{currentPlan}</span> plan
              </p>
            </div>
            {profile.subscription_end_date && (
              <p className="text-sm text-muted-foreground mt-1">
                Valid until: {new Date(profile.subscription_end_date).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className={currentPlan === 'free' && !isAdmin ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {plans.free.name}
              {currentPlan === 'free' && !isAdmin && (
                <Badge variant="secondary">Current</Badge>
              )}
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">₹{plans.free.price}</span>
              <span className="text-muted-foreground ml-2">{plans.free.period}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plans.free.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.isNegative ? 'text-muted-foreground' : ''}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" disabled onClick={() => {}}>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Plan */}
        <Card className={currentPlan === 'monthly' ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {plans.monthly.name}
              {currentPlan === 'monthly' && (
                <Badge variant="default">Active</Badge>
              )}
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">₹{plans.monthly.price}</span>
              <span className="text-muted-foreground ml-2">{plans.monthly.period}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plans.monthly.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{feature.name}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              onClick={() => handleSubscribe('monthly')}
              disabled={loading || currentPlan === 'monthly' || isAdmin}
            >
              {currentPlan === 'monthly' ? 'Current Plan' : 'Subscribe Now'}
            </Button>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className={`${currentPlan === 'yearly' ? 'border-primary' : ''} relative`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-green-500 hover:bg-green-600">
              Save ₹{plans.yearly.savings}
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {plans.yearly.name}
              {currentPlan === 'yearly' && (
                <Badge variant="default">Active</Badge>
              )}
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">₹{plans.yearly.price}</span>
              <span className="text-muted-foreground ml-2">{plans.yearly.period}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plans.yearly.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${feature.highlight ? 'text-green-600' : 'text-green-500'}`} />
                  <span className={feature.highlight ? 'font-semibold text-green-600' : ''}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleSubscribe('yearly')}
              disabled={loading || currentPlan === 'yearly' || isAdmin}
            >
              {currentPlan === 'yearly' ? 'Current Plan' : 'Subscribe Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Info */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Payment Methods</CardTitle>
          <CardDescription>We accept multiple payment options for your convenience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                💳
              </div>
              <div>
                <p className="font-medium">Credit/Debit Card</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                📱
              </div>
              <div>
                <p className="font-medium">UPI</p>
                <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm, BHIM</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                🏦
              </div>
              <div>
                <p className="font-medium">Net Banking</p>
                <p className="text-xs text-muted-foreground">All major banks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refund Policy Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
            <DialogDescription>
              Please review our refund policy before proceeding with payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">7-Day Money-Back Guarantee</h4>
              <p className="text-xs text-muted-foreground">
                We offer a full refund if you request within 7 days of your first purchase. 
                Renewal payments are non-refundable.
              </p>
              <Link 
                to="/refund-policy" 
                target="_blank" 
                className="text-xs text-primary hover:underline inline-block mt-2"
              >
                Read full Refund Policy →
              </Link>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="agreeRefund"
                checked={agreeToRefundPolicy}
                onChange={(e) => setAgreeToRefundPolicy(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
              />
              <label htmlFor="agreeRefund" className="text-sm">
                I have read and agree to the{' '}
                <Link to="/refund-policy" target="_blank" className="text-primary hover:underline">
                  Refund Policy
                </Link>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button onClick={proceedWithPayment} disabled={!agreeToRefundPolicy || loading}>
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
