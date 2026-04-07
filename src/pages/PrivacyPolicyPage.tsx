import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg">Your privacy is our priority</p>
          <p className="text-sm text-muted-foreground mt-2">Last Updated: March 21, 2026</p>
        </div>

        <Card className="shadow-xl border-2">
          <CardContent className="prose prose-sm max-w-none space-y-8 pt-8">
            <section className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border-l-4 border-primary">
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3 text-foreground">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to BusinessPlus. We are committed to protecting your personal information and your right to privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
                  our Internal Billing Management System.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border">
            <div className="flex items-start gap-4">
              <Eye className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
                <p className="text-muted-foreground mb-3">We collect information that you provide directly to us:</p>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Account Information:</strong>
                      <span className="text-muted-foreground"> Username, email address, password (encrypted)</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Company Information:</strong>
                      <span className="text-muted-foreground"> Company name, GST number, address, contact details, logo</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Business Data:</strong>
                      <span className="text-muted-foreground"> Bills, purchase orders, delivery challans, stock information, customer and supplier details</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Payment Information:</strong>
                      <span className="text-muted-foreground"> Transaction details processed through Razorpay (we do not store card details)</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Usage Data:</strong>
                      <span className="text-muted-foreground"> Log data, device information, browser type, IP address</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-2">We use the collected information for:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Providing and maintaining our billing management services</li>
              <li>Processing your transactions and managing subscriptions</li>
              <li>Sending administrative information, updates, and security alerts</li>
              <li>Responding to your inquiries and providing customer support</li>
              <li>Monitoring and analyzing usage patterns to improve our services</li>
              <li>Detecting and preventing fraud and security threats</li>
              <li>Complying with legal obligations and enforcing our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
            <p className="text-muted-foreground">
              Your data is stored securely using Supabase infrastructure with industry-standard encryption. 
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. All data is isolated per user 
              account, ensuring complete privacy between different organizations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-2">We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> With third-party vendors like Razorpay for payment processing</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Object to or restrict certain processing of your information</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as your account is active or as needed to provide services. 
              After account deletion, we may retain certain information for legal, tax, or regulatory purposes 
              for a period of 7 years as required by Indian law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use essential cookies and similar tracking technologies to maintain your session and provide 
              core functionality. We do not use advertising or third-party tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
            <p className="text-muted-foreground">
              BusinessPlus is not intended for users under 18 years of age. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the "Last Updated" date. Continued use of our services 
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="bg-primary/5 p-6 rounded-lg border border-primary/20">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="bg-background p-5 rounded-lg border-2 border-primary/20 space-y-2">
                  <p className="text-foreground flex items-center gap-2">
                    <span className="font-semibold">Email:</span> 
                    <a href="mailto:solutions.businessplus@gmail.com" className="text-primary hover:underline">solution.businessplus@gmail.com</a>
                  </p>
                  <p className="text-foreground flex items-center gap-2">
                    <span className="font-semibold">Support:</span> 
                    <a href="mailto:solution.businessplus@gmail.com" className="text-primary hover:underline">solution.businessplus@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t-2 pt-8 mt-8 bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium text-foreground">
                By using BusinessPlus, you acknowledge that you have read and understood this Privacy Policy 
                and agree to its terms.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/login" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Back to Login
              </Link>
              <Link to="/terms-conditions" className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                View Terms & Conditions
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
