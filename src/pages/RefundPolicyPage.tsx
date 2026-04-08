import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RefundPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold ">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              At BusinessPlus, we strive to provide the best billing management service possible. This Refund Policy outlines 
              the circumstances under which refunds may be issued for our premium subscription services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>BusinessPlus offers the following subscription plans:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Free Plan:</strong> No payment required, no refunds applicable</li>
              <li><strong>Monthly Premium Plan:</strong> Billed monthly, subject to refund policy below</li>
              <li><strong>Annual Premium Plan:</strong> Billed annually, subject to refund policy below</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>30-Day Money-Back Guarantee</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">First-Time Subscribers</h3>
              <p>
                If you are a first-time subscriber to our Premium Plan, we offer a 30-day money-back guarantee. If you are 
                not satisfied with our service for any reason, you may request a full refund within 30 days of your initial 
                subscription purchase.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Eligibility Requirements</h3>
              <p>To be eligible for the 30-day money-back guarantee:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must be a first-time subscriber (not applicable to renewals)</li>
                <li>The refund request must be made within 30 days of the initial purchase date</li>
                <li>You must provide a reason for the refund request</li>
                <li>Your account must not have violated our Terms and Conditions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refund Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Refunds Will Be Issued For:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Duplicate charges or billing errors</li>
                <li>Service unavailability for extended periods (more than 48 consecutive hours)</li>
                <li>Technical issues that prevent you from using core features, if not resolved within 7 days</li>
                <li>Unauthorized charges on your account</li>
                <li>First-time subscriptions within the 30-day money-back guarantee period</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Refunds Will NOT Be Issued For:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Subscription renewals (after the initial 30-day period)</li>
                <li>Partial month or year subscriptions (no pro-rated refunds)</li>
                <li>Change of mind after the 30-day guarantee period</li>
                <li>Failure to cancel before the renewal date</li>
                <li>Accounts suspended or terminated due to Terms and Conditions violations</li>
                <li>Third-party service failures beyond our control</li>
                <li>User error or misuse of the service</li>
                <li>Dissatisfaction with features that were clearly described before purchase</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Request a Refund</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>To request a refund, please follow these steps:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong>Contact Support:</strong> Email us at Solutions.businessplus@gmail.com with the subject line "Refund Request"
              </li>
              <li>
                <strong>Provide Information:</strong> Include your account email, subscription details, and reason for the refund request
              </li>
              <li>
                <strong>Wait for Review:</strong> Our team will review your request within 3-5 business days
              </li>
              <li>
                <strong>Receive Decision:</strong> You will receive an email with our decision and next steps
              </li>
            </ol>
            <p className="mt-4">
              <strong>Required Information:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your registered email address</li>
              <li>Transaction ID or receipt number</li>
              <li>Date of purchase</li>
              <li>Detailed reason for refund request</li>
              <li>Any supporting documentation (screenshots, error messages, etc.)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refund Processing</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Processing Time</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Refund requests are reviewed within 3-5 business days</li>
                <li>Approved refunds are processed within 7-10 business days</li>
                <li>Refunds are issued to the original payment method</li>
                <li>Bank processing times may vary (typically 5-10 business days)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Refund Amount</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full refund: 100% of the subscription fee (within 30-day guarantee period)</li>
                <li>Billing errors: Full amount of the erroneous charge</li>
                <li>Service unavailability: Pro-rated refund based on downtime</li>
                <li>Transaction fees and currency conversion charges are non-refundable</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Account Status After Refund</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your premium subscription will be immediately downgraded to the free plan</li>
                <li>You will lose access to premium features</li>
                <li>Your data will be retained and accessible on the free plan</li>
                <li>You may re-subscribe at any time (30-day guarantee applies only once per account)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cancellation vs. Refund</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              <strong>Important Distinction:</strong> Cancellation and refund are different processes.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Cancellation:</strong> Stops future billing but does not refund the current period. You retain access 
                until the end of the paid period.
              </li>
              <li>
                <strong>Refund:</strong> Returns your payment and immediately downgrades your account to the free plan.
              </li>
            </ul>
            <p className="mt-2">
              If you simply want to stop future charges, cancel your subscription instead of requesting a refund.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exceptions and Special Cases</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Service Outages</h3>
              <p>
                If our service experiences an outage lasting more than 48 consecutive hours, affected users may be eligible 
                for a pro-rated refund or account credit, regardless of the 30-day guarantee period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Billing Errors</h3>
              <p>
                If you are charged incorrectly due to a system error, we will issue a full refund immediately upon verification, 
                regardless of when the charge occurred.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Fraudulent Charges</h3>
              <p>
                If you believe your account was charged fraudulently, contact us immediately. We will investigate and issue a 
                refund if fraud is confirmed. You should also contact your bank or credit card company.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              If your refund request is denied and you disagree with the decision, you may:
            </p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Request a review by escalating to our senior support team</li>
              <li>Provide additional documentation to support your claim</li>
              <li>Contact your payment provider to dispute the charge (chargeback)</li>
            </ol>
            <p className="mt-2">
              <strong>Note:</strong> Filing a chargeback without first contacting us may result in account suspension and 
              may affect your ability to use our services in the future.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an 
              updated "Last updated" date. Your continued use of the service after changes constitutes acceptance of the 
              new policy. However, changes will not affect refund requests made before the policy change.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>If you have any questions about this Refund Policy or need to request a refund, please contact us:</p>
            <ul className="list-none space-y-2 mt-2">
              <li><strong>Email:</strong> Solutions.businessplus@gmail.com</li>
              <li><strong>Subject Line:</strong> "Refund Request" or "Refund Policy Question"</li>
              <li><strong>Website:</strong> www.businessplus.in</li>
            </ul>
            <p className="mt-4">
              Our support team is available Monday through Friday, 9:00 AM to 6:00 PM IST. We aim to respond to all 
              refund requests within 3-5 business days.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
