import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Database, Eye, FileCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DataSecurityPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold ">Data Security Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Our Commitment to Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              At BusinessPlus, we take the security of your data seriously. This Data Security Policy outlines the measures 
              we implement to protect your information from unauthorized access, disclosure, alteration, and destruction. 
              We are committed to maintaining the highest standards of data security and privacy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Data Encryption
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Encryption in Transit</h3>
              <p>All data transmitted between your device and our servers is encrypted using:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>TLS 1.3:</strong> Industry-standard Transport Layer Security protocol</li>
                <li><strong>HTTPS:</strong> All connections use secure HTTPS protocol</li>
                <li><strong>Strong Cipher Suites:</strong> We use only modern, secure encryption algorithms</li>
                <li><strong>Certificate Validation:</strong> SSL/TLS certificates are regularly updated and validated</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Encryption at Rest</h3>
              <p>Your data stored on our servers is protected with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>AES-256 Encryption:</strong> Military-grade encryption for stored data</li>
                <li><strong>Database Encryption:</strong> All database tables are encrypted at rest</li>
                <li><strong>File Storage Encryption:</strong> Uploaded files (logos, documents) are encrypted</li>
                <li><strong>Backup Encryption:</strong> All backups are encrypted before storage</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data Isolation and Access Control
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Row-Level Security (RLS)</h3>
              <p>We implement strict data isolation to ensure your data remains private:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Each user's data is isolated at the database level using Row-Level Security</li>
                <li>Users can only access their own bills, purchase orders, customers, and stock data</li>
                <li>Database policies prevent unauthorized cross-user data access</li>
                <li>Even database administrators cannot access user data without proper authorization</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Role-Based Access Control (RBAC)</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Admin Users:</strong> Full access to their own company data and user management</li>
                <li><strong>Regular Users:</strong> Access to operational features within their company scope</li>
                <li><strong>Principle of Least Privilege:</strong> Users have only the minimum necessary permissions</li>
                <li><strong>Access Logging:</strong> All data access is logged for security auditing</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Authentication Security</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Secure Password Storage:</strong> Passwords are hashed using bcrypt with salt</li>
                <li><strong>OAuth 2.0:</strong> Support for Google OAuth for secure authentication</li>
                <li><strong>Session Management:</strong> Secure session tokens with automatic expiration</li>
                <li><strong>Multi-Factor Authentication:</strong> Available for enhanced account security</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Infrastructure Security
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Hosting and Infrastructure</h3>
              <p>Our application is hosted on secure, enterprise-grade infrastructure:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Supabase:</strong> Enterprise-grade backend-as-a-service with built-in security</li>
                <li><strong>PostgreSQL:</strong> Secure, reliable database with advanced security features</li>
                <li><strong>Cloud Infrastructure:</strong> Hosted on AWS with multiple security layers</li>
                <li><strong>DDoS Protection:</strong> Protection against distributed denial-of-service attacks</li>
                <li><strong>Firewall Protection:</strong> Network-level firewalls to block unauthorized access</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Network Security</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Virtual Private Cloud (VPC) isolation</li>
                <li>Network segmentation and access controls</li>
                <li>Intrusion detection and prevention systems</li>
                <li>Regular security patches and updates</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Application Security</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Input Validation:</strong> All user inputs are validated and sanitized</li>
                <li><strong>SQL Injection Prevention:</strong> Parameterized queries prevent SQL injection</li>
                <li><strong>XSS Protection:</strong> Content Security Policy and output encoding</li>
                <li><strong>CSRF Protection:</strong> Anti-CSRF tokens for all state-changing operations</li>
                <li><strong>Rate Limiting:</strong> Protection against brute force and abuse</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Monitoring and Incident Response
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Security Monitoring</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>24/7 Monitoring:</strong> Continuous monitoring of system security and performance</li>
                <li><strong>Automated Alerts:</strong> Real-time alerts for suspicious activities</li>
                <li><strong>Access Logs:</strong> Comprehensive logging of all data access and modifications</li>
                <li><strong>Anomaly Detection:</strong> AI-powered detection of unusual patterns</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Incident Response</h3>
              <p>In the event of a security incident, we have a comprehensive response plan:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Immediate Response:</strong> Security team responds within 1 hour of detection</li>
                <li><strong>Containment:</strong> Affected systems are isolated to prevent further damage</li>
                <li><strong>Investigation:</strong> Thorough analysis to determine cause and scope</li>
                <li><strong>Remediation:</strong> Vulnerabilities are patched and systems are secured</li>
                <li><strong>Notification:</strong> Affected users are notified within 72 hours as required by law</li>
                <li><strong>Post-Incident Review:</strong> Lessons learned are documented and implemented</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Backup and Recovery</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Backup Strategy</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Automated Backups:</strong> Daily automated backups of all data</li>
                <li><strong>Incremental Backups:</strong> Continuous incremental backups throughout the day</li>
                <li><strong>Geographic Redundancy:</strong> Backups stored in multiple geographic locations</li>
                <li><strong>Encrypted Backups:</strong> All backups are encrypted before storage</li>
                <li><strong>Retention Policy:</strong> Backups retained for 30 days</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Disaster Recovery</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Recovery Time Objective (RTO):</strong> 4 hours</li>
                <li><strong>Recovery Point Objective (RPO):</strong> 1 hour</li>
                <li><strong>Tested Recovery Procedures:</strong> Regular disaster recovery drills</li>
                <li><strong>Failover Systems:</strong> Automatic failover to backup systems</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance and Certifications</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>We adhere to industry-standard security practices and regulations:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>GDPR Compliance:</strong> General Data Protection Regulation compliance for EU users</li>
              <li><strong>SOC 2 Type II:</strong> Our infrastructure provider (Supabase/AWS) is SOC 2 certified</li>
              <li><strong>ISO 27001:</strong> Information security management standards</li>
              <li><strong>PCI DSS:</strong> Payment Card Industry Data Security Standard for payment processing</li>
              <li><strong>Indian IT Act 2000:</strong> Compliance with Indian data protection laws</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Access and Training</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Access Controls</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Limited employee access to production systems</li>
                <li>Multi-factor authentication required for all employee accounts</li>
                <li>Regular access reviews and revocation of unnecessary permissions</li>
                <li>Audit trails for all administrative actions</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Security Training</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Mandatory security training for all employees</li>
                <li>Regular security awareness updates</li>
                <li>Secure coding practices for developers</li>
                <li>Incident response training</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Third-Party Security</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>We carefully vet all third-party services and vendors:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Vendor Assessment:</strong> Security assessment before integration</li>
              <li><strong>Data Processing Agreements:</strong> Signed agreements with all data processors</li>
              <li><strong>Regular Audits:</strong> Periodic security audits of third-party services</li>
              <li><strong>Minimal Data Sharing:</strong> Only necessary data is shared with third parties</li>
            </ul>
            <p className="mt-2">Our key third-party services include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase:</strong> Database and authentication (SOC 2 Type II certified)</li>
              <li><strong>AWS:</strong> Cloud infrastructure (multiple security certifications)</li>
              <li><strong>Payment Processors:</strong> PCI DSS compliant payment gateways</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Your Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>While we implement robust security measures, you also play a crucial role in protecting your data:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Strong Passwords:</strong> Use strong, unique passwords for your account</li>
              <li><strong>Password Security:</strong> Never share your password with others</li>
              <li><strong>Secure Devices:</strong> Keep your devices and software up to date</li>
              <li><strong>Phishing Awareness:</strong> Be cautious of phishing emails and suspicious links</li>
              <li><strong>Logout:</strong> Log out when using shared or public computers</li>
              <li><strong>Report Issues:</strong> Report any suspicious activity immediately</li>
              <li><strong>Regular Backups:</strong> Maintain your own backups of critical data</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention and Deletion</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Active Data:</strong> Retained as long as your account is active</li>
              <li><strong>Deleted Data:</strong> Securely deleted within 30 days of account closure</li>
              <li><strong>Backup Data:</strong> Removed from backups within 30 days</li>
              <li><strong>Legal Holds:</strong> Data may be retained longer if required by law</li>
              <li><strong>Secure Deletion:</strong> Data is securely overwritten to prevent recovery</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Updates and Improvements</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>We continuously improve our security measures:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Regular Updates:</strong> Security patches applied within 24 hours of release</li>
              <li><strong>Vulnerability Scanning:</strong> Automated scanning for security vulnerabilities</li>
              <li><strong>Penetration Testing:</strong> Annual third-party security audits</li>
              <li><strong>Security Research:</strong> Continuous monitoring of emerging threats</li>
              <li><strong>Bug Bounty Program:</strong> Rewards for responsible disclosure of vulnerabilities</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reporting Security Issues</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>If you discover a security vulnerability or have security concerns, please report them immediately:</p>
            <ul className="list-none space-y-2 mt-2">
              <li><strong>Security Email:</strong> Solutions.businessplus@gmail.com</li>
              <li><strong>Response Time:</strong> We respond to security reports within 24 hours</li>
              <li><strong>Responsible Disclosure:</strong> Please allow us time to fix issues before public disclosure</li>
            </ul>
            <p className="mt-4">
              <strong>What to Include:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Detailed description of the vulnerability</li>
              <li>Steps to reproduce the issue</li>
              <li>Potential impact assessment</li>
              <li>Your contact information for follow-up</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              We may update this Data Security Policy to reflect changes in our security practices or legal requirements. 
              We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" 
              date. We encourage you to review this policy periodically.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>If you have any questions about our data security practices, please contact us:</p>
            <ul className="list-none space-y-2 mt-2">
              <li><strong>General Inquiries:</strong> Solutions.businessplus@gmail.com</li>
              <li><strong>Security Issues:</strong> Solutions.businessplus@gmail.com</li>
              <li><strong>Data Protection Officer:</strong> Solutions.businessplus@gmail.com</li>
              <li><strong>Website:</strong> www.businessplus.in</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
