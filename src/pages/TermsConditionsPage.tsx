import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle2, AlertCircle, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-secondary/10 rounded-full">
              <Scale className="h-12 w-12 text-secondary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-secondary/60 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-lg">Please read these terms carefully</p>
          <p className="text-sm text-muted-foreground mt-2">Last Updated: March 21, 2026</p>
        </div>

        <Card className="shadow-xl border-2">
          <CardContent className="prose prose-sm max-w-none space-y-8 pt-8">
            <section className="bg-gradient-to-r from-secondary/10 to-primary/10 p-6 rounded-lg border-l-4 border-secondary">
              <div className="flex items-start gap-4">
                <FileText className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-foreground">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using BusinessPlus ("the Service"), you accept and agree to be bound by these Terms and 
                    Conditions. If you do not agree to these terms, please do not use our Service. These terms apply to all 
                    users, including administrators and regular users.
                  </p>
                </div>
              </div>
            </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
            <p className="text-muted-foreground">
              BusinessPlus is an Internal Billing Management System designed for businesses to manage billing, purchase 
              orders, delivery challans, inventory, customer relationships, and financial reporting. The Service is 
              provided on a subscription basis with Free and Premium plans.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">3.1 Account Creation</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You must provide accurate and complete information during registration</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must be at least 18 years old to create an account</li>
              <li>One account per organization is recommended for data isolation</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.2 Account Security</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You are responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>We are not liable for losses due to unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Subscription Plans</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">4.1 Free Plan</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access to all core features with watermarks on printed documents</li>
              <li>No credit card required</li>
              <li>Subject to fair usage limits</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">4.2 Premium Plans</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Monthly Plan:</strong> ₹249/month - Billed monthly</li>
              <li><strong>Yearly Plan:</strong> ₹2,500/year - Billed annually (Save ₹488)</li>
              <li>Removes watermarks from all documents</li>
              <li>Priority support</li>
              <li>All future premium features</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">4.3 Payment Terms</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Payments are processed securely through Razorpay</li>
              <li>All prices are in Indian Rupees (INR) and include applicable taxes</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Acceptable Use Policy</h2>
            <p className="text-muted-foreground mb-2">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction (including copyright laws)</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to other users' data</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Ownership and Usage</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">6.1 Your Data</h3>
            <p className="text-muted-foreground">
              You retain all ownership rights to the data you input into the Service (bills, customers, inventory, etc.). 
              We do not claim ownership of your business data.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">6.2 Our Rights</h3>
            <p className="text-muted-foreground">
              You grant us a limited license to use, store, and process your data solely to provide the Service. 
              We may use anonymized, aggregated data for analytics and service improvement.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">6.3 Data Isolation</h3>
            <p className="text-muted-foreground">
              All user data is strictly isolated. No user can access another user's data. Each account operates 
              independently with complete data privacy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Service, including its design, features, code, and content, is owned by BusinessPlus and protected 
              by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, 
              or reverse engineer any part of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Service Availability</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>We strive for 99.9% uptime but do not guarantee uninterrupted service</li>
              <li>Scheduled maintenance will be announced in advance when possible</li>
              <li>We are not liable for service interruptions beyond our control</li>
              <li>We reserve the right to modify or discontinue features with notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">9.1 By You</h3>
            <p className="text-muted-foreground">
              You may cancel your subscription at any time. Upon cancellation, you will retain access until the 
              end of your billing period. No refunds for partial periods.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">9.2 By Us</h3>
            <p className="text-muted-foreground">
              We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, 
              or for non-payment. We will provide notice when possible.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">9.3 Data After Termination</h3>
            <p className="text-muted-foreground">
              You may export your data before termination. After account deletion, data may be retained for 
              legal/regulatory purposes for up to 7 years.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Disclaimers and Limitations</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">10.1 Warranty Disclaimer</h3>
            <p className="text-muted-foreground">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT 
              WARRANT THAT THE SERVICE WILL BE ERROR-FREE OR UNINTERRUPTED.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">10.2 Limitation of Liability</h3>
            <p className="text-muted-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUSINESSPLUS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
              SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL 
              NOT EXCEED THE AMOUNT YOU PAID IN THE LAST 12 MONTHS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold BusinessPlus harmless from any claims, damages, or expenses arising 
              from your use of the Service, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive 
              jurisdiction of courts in [Your City], India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. We will notify you of material changes via email or 
              in-app notification. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="bg-secondary/5 p-6 rounded-lg border border-secondary/20">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Contact Information</h2>
                <div className="bg-background p-5 rounded-lg border-2 border-secondary/20 space-y-2">
                  <p className="text-foreground flex items-center gap-2">
                    <span className="font-semibold">Email:</span> 
                    <a href="mailto:solution.businessplus@gmail.com" className="text-secondary hover:underline">solution.businessplus@gmail.com</a>
                  </p>
                  <p className="text-foreground flex items-center gap-2">
                    <span className="font-semibold">Support:</span> 
                    <a href="mailto:solution.businessplus@gmail.com" className="text-secondary hover:underline">solution.businessplus@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t-2 pt-8 mt-8 bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
              <p className="text-sm font-medium text-foreground">
                By using BusinessPlus, you acknowledge that you have read, understood, and agree to be bound by 
                these Terms and Conditions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/login" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Back to Login
              </Link>
              <Link to="/privacy-policy" className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                View Privacy Policy
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
