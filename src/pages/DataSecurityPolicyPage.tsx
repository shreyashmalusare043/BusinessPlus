import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Database, Eye, FileCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DataSecurityPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20">
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Data Security Policy
          </h1>
          <p className="text-muted-foreground text-lg">Your data security is our top priority</p>
          <p className="text-sm text-muted-foreground mt-2">Last Updated: March 21, 2026</p>
        </div>

        <Card className="shadow-xl border-2">
          <CardContent className="prose prose-sm max-w-none space-y-8 pt-8">
            <section className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-foreground">1. Our Commitment to Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    At BusinessPlus, we understand that your business data is critical and confidential. We are committed to 
                    implementing and maintaining robust security measures to protect your information from unauthorized 
                    access, disclosure, alteration, or destruction. This Data Security Policy outlines our comprehensive 
                    approach to safeguarding your data.
                  </p>
                </div>
              </div>
            </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Data Encryption</h2>
            <div className="flex items-start gap-3 mb-3">
              <Lock className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-medium mb-2">2.1 Encryption in Transit</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>All data transmitted between your browser and our servers is encrypted using TLS 1.3 (Transport Layer Security)</li>
                  <li>HTTPS protocol is enforced for all connections</li>
                  <li>No unencrypted HTTP traffic is permitted</li>
                  <li>SSL certificates are regularly updated and monitored</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-medium mb-2">2.2 Encryption at Rest</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>All data stored in our databases is encrypted using AES-256 encryption</li>
                  <li>Database backups are also encrypted</li>
                  <li>Passwords are hashed using bcrypt with salt</li>
                  <li>Sensitive fields (GST numbers, financial data) receive additional encryption layers</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data Isolation and Access Control</h2>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-medium mb-2">3.1 Multi-Tenant Isolation</h3>
                <p className="text-muted-foreground mb-2">
                  BusinessPlus implements strict data isolation to ensure complete privacy between users:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Row-Level Security (RLS):</strong> Database policies ensure users can only access their own data</li>
                  <li><strong>User-Scoped Queries:</strong> All database queries are automatically filtered by user ID</li>
                  <li><strong>No Cross-User Access:</strong> It is technically impossible for one user to view another user's data</li>
                  <li><strong>Independent Data Spaces:</strong> Each account operates in a completely isolated environment</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-4">
              <Eye className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-medium mb-2">3.2 Role-Based Access Control (RBAC)</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Admin Role:</strong> Full access to all features including user management</li>
                  <li><strong>Regular User Role:</strong> Access to billing, inventory, and reporting features</li>
                  <li>Permissions are enforced at both application and database levels</li>
                  <li>Users cannot escalate their own privileges</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Infrastructure Security</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">4.1 Hosting and Infrastructure</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Supabase Platform:</strong> Built on enterprise-grade PostgreSQL with automatic security updates</li>
              <li><strong>Cloud Infrastructure:</strong> Hosted on AWS with SOC 2 Type II compliance</li>
              <li><strong>Geographic Redundancy:</strong> Data is replicated across multiple availability zones</li>
              <li><strong>DDoS Protection:</strong> Built-in protection against distributed denial-of-service attacks</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">4.2 Network Security</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Firewalls configured to allow only necessary traffic</li>
              <li>Intrusion detection and prevention systems (IDS/IPS)</li>
              <li>Regular security audits and penetration testing</li>
              <li>IP whitelisting available for enterprise customers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Authentication and Session Management</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">5.1 Authentication Security</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Passwords must meet minimum complexity requirements</li>
              <li>Passwords are never stored in plain text (bcrypt hashing)</li>
              <li>Account lockout after multiple failed login attempts</li>
              <li>Optional two-factor authentication (2FA) available</li>
              <li>OAuth integration with Google for secure login</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">5.2 Session Security</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Secure, HTTP-only cookies for session management</li>
              <li>Sessions expire after 24 hours of inactivity</li>
              <li>Automatic logout on browser close (configurable)</li>
              <li>Session tokens are cryptographically signed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Payment Security</h2>
            <div className="flex items-start gap-3">
              <FileCheck className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="text-muted-foreground mb-2">
                  All payment processing is handled by <strong>Razorpay</strong>, a PCI DSS Level 1 certified payment gateway:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>We never store credit card numbers, CVV, or full card details</li>
                  <li>Payment data is encrypted end-to-end by Razorpay</li>
                  <li>Only transaction IDs and payment status are stored in our database</li>
                  <li>All payment pages use 256-bit SSL encryption</li>
                  <li>Razorpay complies with RBI (Reserve Bank of India) guidelines</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Backup and Recovery</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">7.1 Automated Backups</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Full database backups every 24 hours</li>
              <li>Incremental backups every 6 hours</li>
              <li>Backups are encrypted and stored in geographically separate locations</li>
              <li>30-day backup retention period</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">7.2 Disaster Recovery</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Recovery Point Objective (RPO): 6 hours</li>
              <li>Recovery Time Objective (RTO): 4 hours</li>
              <li>Regular disaster recovery drills and testing</li>
              <li>Documented recovery procedures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Application Security</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">8.1 Secure Development Practices</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Code reviews for all changes</li>
              <li>Automated security scanning in CI/CD pipeline</li>
              <li>Regular dependency updates and vulnerability patching</li>
              <li>Input validation and sanitization to prevent injection attacks</li>
              <li>Protection against OWASP Top 10 vulnerabilities</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">8.2 Protection Against Common Threats</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>SQL Injection:</strong> Parameterized queries and ORM usage</li>
              <li><strong>Cross-Site Scripting (XSS):</strong> Content Security Policy and output encoding</li>
              <li><strong>Cross-Site Request Forgery (CSRF):</strong> Token-based protection</li>
              <li><strong>Clickjacking:</strong> X-Frame-Options headers</li>
              <li><strong>Brute Force:</strong> Rate limiting and account lockout</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Monitoring and Incident Response</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">9.1 Security Monitoring</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>24/7 automated monitoring of system logs and security events</li>
              <li>Real-time alerts for suspicious activities</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Compliance monitoring and reporting</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">9.2 Incident Response</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Documented incident response plan</li>
              <li>Dedicated security team for incident handling</li>
              <li>User notification within 72 hours of confirmed breach (GDPR compliance)</li>
              <li>Post-incident analysis and remediation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Data Retention and Deletion</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">10.1 Data Retention</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Active account data is retained indefinitely while account is active</li>
              <li>Deleted data is retained for 30 days in soft-delete state (recoverable)</li>
              <li>After 30 days, data is permanently deleted from production systems</li>
              <li>Backup retention: 30 days for compliance and recovery purposes</li>
              <li>Legal/regulatory data may be retained for 7 years as required by Indian law</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">10.2 Secure Data Deletion</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Data is securely wiped using industry-standard methods</li>
              <li>No data remnants left on storage media</li>
              <li>Deletion logs maintained for audit purposes</li>
              <li>Users can request data export before deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Third-Party Security</h2>
            <p className="text-muted-foreground mb-2">We carefully vet all third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Supabase:</strong> SOC 2 Type II compliant, ISO 27001 certified</li>
              <li><strong>Razorpay:</strong> PCI DSS Level 1 certified, RBI compliant</li>
              <li><strong>AWS:</strong> Multiple compliance certifications (SOC, ISO, PCI DSS)</li>
              <li>All third parties sign Data Processing Agreements (DPAs)</li>
              <li>Regular security assessments of third-party vendors</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Compliance and Certifications</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>GDPR:</strong> General Data Protection Regulation compliance</li>
              <li><strong>Indian IT Act 2000:</strong> Compliance with Indian data protection laws</li>
              <li><strong>GST Compliance:</strong> Secure handling of GST-related data</li>
              <li><strong>ISO 27001:</strong> Information security management (via infrastructure providers)</li>
              <li>Regular compliance audits and assessments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. User Responsibilities</h2>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="text-muted-foreground mb-2">While we implement robust security measures, users also play a critical role:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Use strong, unique passwords (minimum 8 characters with mix of letters, numbers, symbols)</li>
                  <li>Never share your login credentials with others</li>
                  <li>Log out when using shared or public computers</li>
                  <li>Keep your browser and operating system updated</li>
                  <li>Report suspicious activities immediately</li>
                  <li>Enable two-factor authentication when available</li>
                  <li>Review account activity regularly</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Security Updates and Notifications</h2>
            <p className="text-muted-foreground">
              We will notify users of:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Security incidents affecting their data (within 72 hours)</li>
              <li>Major security updates or policy changes</li>
              <li>Scheduled maintenance that may affect security features</li>
              <li>New security features or enhancements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">15. Reporting Security Issues</h2>
            <p className="text-muted-foreground mb-2">
              If you discover a security vulnerability or have security concerns:
            </p>
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-foreground">15. Reporting Security Issues</h2>
                  <p className="text-muted-foreground mb-4">
                    If you discover a security vulnerability or have security concerns:
                  </p>
                  <div className="bg-background p-5 rounded-lg border-2 border-blue-200 dark:border-blue-800 space-y-2">
                    <p className="text-foreground flex items-center gap-2">
                      <span className="font-semibold">Security Email:</span> 
                      <a href="mailto:solution.businessplus@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">solution.businessplus@gmail.com</a>
                    </p>
                    <p className="text-foreground flex items-center gap-2">
                      <span className="font-semibold">Response Time:</span> Within 24 hours
                    </p>
                    <p className="text-foreground flex items-center gap-2">
                      <span className="font-semibold">Bug Bounty:</span> Responsible disclosure program available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t-2 pt-8 mt-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Security Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">AES-256 encryption at rest, TLS 1.3 in transit</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Complete data isolation between users</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">PCI DSS compliant payment processing</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Database className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Automated daily backups with 30-day retention</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">24/7 security monitoring and incident response</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">GDPR and Indian IT Act compliance</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-foreground">
                By using BusinessPlus and entering your company information, you acknowledge that you have read and 
                understood this Data Security Policy and trust us to protect your business data.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/login" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Back to Login
              </Link>
              <Link to="/privacy-policy" className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
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
