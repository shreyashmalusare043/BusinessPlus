import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-background to-blue-50/50 dark:from-green-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
              <DollarSign className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
            Refund Policy
          </h1>
          <p className="text-muted-foreground text-lg">7-Day Money-Back Guarantee</p>
          <p className="text-sm text-muted-foreground mt-2">Last Updated: March 21, 2026</p>
        </div>

        <Card className="shadow-xl border-2">
          <CardContent className="prose prose-sm max-w-none space-y-8 pt-8">
            <section className="bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border-l-4 border-green-500">
              <div className="flex items-start gap-4">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-foreground">1. Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    At BusinessPlus, we strive to provide the best billing management experience. This Refund Policy outlines 
                    the circumstances under which refunds may be issued for subscription payments. Please read this policy 
                    carefully before making a purchase.
                  </p>
                </div>
              </div>
            </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Free Plan</h2>
            <p className="text-muted-foreground">
              Our Free Plan does not require payment and therefore no refunds are applicable. You may use the Free 
              Plan indefinitely with watermarks on printed documents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Premium Subscription Refunds</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">3.1 7-Day Money-Back Guarantee</h3>
            <p className="text-muted-foreground mb-2">
              We offer a <strong>7-day money-back guarantee</strong> for first-time Premium subscribers:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Applies to both Monthly (₹249) and Yearly (₹2,500) plans</li>
              <li>Valid only for your first Premium subscription purchase</li>
              <li>Request must be made within 7 days of payment</li>
              <li>Full refund will be processed to your original payment method</li>
              <li>Refund processing time: 5-7 business days</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.2 Eligibility Criteria</h3>
            <p className="text-muted-foreground mb-2">To be eligible for a refund, you must:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Submit a refund request within 7 days of purchase</li>
              <li>Provide a valid reason for the refund request</li>
              <li>Not have violated our Terms & Conditions</li>
              <li>Not have previously received a refund for BusinessPlus</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.3 Non-Refundable Situations</h3>
            <p className="text-muted-foreground mb-2">Refunds will NOT be issued in the following cases:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Refund request made after 7 days of purchase</li>
              <li>Renewal payments (only initial subscriptions are eligible)</li>
              <li>Partial month/year refunds after the 7-day period</li>
              <li>Change of mind after the 7-day guarantee period</li>
              <li>Account suspension or termination due to Terms violation</li>
              <li>Technical issues on your end (device, internet, browser)</li>
              <li>Failure to cancel before auto-renewal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Subscription Renewals</h2>
            <p className="text-muted-foreground">
              Premium subscriptions auto-renew at the end of each billing period. Renewal payments are 
              <strong> non-refundable</strong>. To avoid being charged for the next period:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Cancel your subscription at least 24 hours before the renewal date</li>
              <li>You will retain access until the end of your current billing period</li>
              <li>No refunds for unused time after cancellation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. How to Request a Refund</h2>
            <p className="text-muted-foreground mb-2">To request a refund within the 7-day guarantee period:</p>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Email us at <strong>solution.businessplus@gmail.com</strong></li>
              <li>Include your account email and transaction ID</li>
              <li>Provide a brief reason for the refund request</li>
              <li>Our team will review and respond within 2 business days</li>
              <li>If approved, refund will be processed within 5-7 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Refund Processing</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">6.1 Processing Time</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Refund approval: 1-2 business days</li>
              <li>Razorpay processing: 3-5 business days</li>
              <li>Bank credit: 2-5 business days (varies by bank)</li>
              <li>Total time: 5-12 business days</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">6.2 Refund Method</h3>
            <p className="text-muted-foreground">
              Refunds are issued to the original payment method used for purchase (credit card, debit card, UPI, 
              net banking). We cannot process refunds to a different payment method.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Service Interruptions</h2>
            <p className="text-muted-foreground">
              If BusinessPlus experiences extended downtime (more than 48 consecutive hours) due to issues on our end, 
              we may offer prorated credits or refunds at our discretion. Scheduled maintenance does not qualify 
              for refunds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Chargebacks</h2>
            <p className="text-muted-foreground">
              If you initiate a chargeback with your bank or payment provider without first contacting us:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Your account will be immediately suspended</li>
              <li>We will dispute the chargeback with evidence of service delivery</li>
              <li>Chargeback fees may be charged to your account</li>
              <li>Please contact us first to resolve any payment disputes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Promotional Offers and Discounts</h2>
            <p className="text-muted-foreground">
              Subscriptions purchased with promotional codes or discounts are eligible for refunds under the same 
              7-day guarantee, but the refund amount will be the actual amount paid (after discount), not the 
              original price.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Account Termination by BusinessPlus</h2>
            <p className="text-muted-foreground">
              If we terminate your account due to violation of our Terms & Conditions, no refund will be issued 
              for any remaining subscription period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to Refund Policy</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately 
              upon posting. The policy in effect at the time of your purchase will apply to that transaction.
            </p>
          </section>

          <section className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  For refund requests or questions about this policy, please contact:
                </p>
                <div className="bg-background p-5 rounded-lg border-2 border-green-200 dark:border-green-800 space-y-2">
                  <p className="text-foreground flex items-center gap-2">
                    <span className="font-semibold">Refunds:</span> 
                    <a href="mailto:solution.businessplus@gmail.com" className="text-green-600 dark:text-green-400 hover:underline">solution.businessplus@gmail.com</a>
                  </p>
                  <p className="text-foreground flex items-center gap-2">
                    <span className="font-semibold">Support:</span> 
                    <a href="mailto:solution.businessplus@gmail.com" className="text-green-600 dark:text-green-400 hover:underline">solution.businessplus@gmail.com</a>
                  </p>
                  <p className="text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="font-semibold">Response Time:</span> Within 2 business days
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t-2 pt-8 mt-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
              <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                Quick Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 dark:text-green-400">✅</span>
                  <span className="text-muted-foreground">7-day money-back guarantee for first-time Premium subscribers</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 dark:text-green-400">✅</span>
                  <span className="text-muted-foreground">Full refund if requested within 7 days</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-red-500">❌</span>
                  <span className="text-muted-foreground">No refunds after 7 days or for renewals</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-red-500">❌</span>
                  <span className="text-muted-foreground">No partial refunds for unused time</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400">📧</span>
                  <span className="text-muted-foreground">Email solution.businessplus@gmail.com to request</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400">⏱️</span>
                  <span className="text-muted-foreground">Processing time: 5-12 business days</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-foreground">
                By subscribing to BusinessPlus Premium, you acknowledge that you have read and agree to this Refund Policy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/login" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Back to Login
              </Link>
              <Link to="/subscription" className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors">
                View Subscription Plans
              </Link>
            </div>
          </section>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>© 2026 BusinessPlus. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
          <Link to="/privacy-policy" className="hover:text-primary hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms-conditions" className="hover:text-primary hover:underline">Terms & Conditions</Link>
          <span>•</span>
          <Link to="/refund-policy" className="hover:text-primary hover:underline">Refund Policy</Link>
          <span>•</span>
          <Link to="/data-security-policy" className="hover:text-primary hover:underline">Data Security</Link>
        </div>
      </div>
      </div>
    </div>
  );
}
