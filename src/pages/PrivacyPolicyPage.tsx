import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              Welcome to BusinessPlus. We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              billing management system.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
              <p>We collect personal information that you voluntarily provide to us when you:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Register for an account</li>
                <li>Create bills, purchase orders, or delivery challans</li>
                <li>Add customer or supplier information</li>
                <li>Contact us for support</li>
              </ul>
              <p className="mt-2">This information may include:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and company name</li>
                <li>Email address and phone number</li>
                <li>Business address</li>
                <li>GST number and tax information</li>
                <li>Payment information</li>
                <li>Business transaction data</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Automatically Collected Information</h3>
              <p>When you use our application, we automatically collect certain information, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Log data (IP address, browser type, operating system)</li>
                <li>Device information</li>
                <li>Usage data (features used, time spent)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, operate, and maintain our billing management system</li>
              <li>Process your transactions and manage your account</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Analyze usage patterns to improve our services</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>With your consent:</strong> We may share your information when you give us explicit permission</li>
              <li><strong>Service providers:</strong> We may share information with third-party service providers who perform services on our behalf (e.g., hosting, analytics)</li>
              <li><strong>Legal requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
              <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure data storage with Supabase</li>
              <li>Regular backups and disaster recovery procedures</li>
            </ul>
            <p className="mt-2">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive 
              to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this 
              Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need 
              your information, we will securely delete or anonymize it.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Data portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Opt-out:</strong> Opt-out of certain data processing activities</li>
              <li><strong>Withdraw consent:</strong> Withdraw your consent at any time</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              We use cookies and similar tracking technologies to track activity on our application and store certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do 
              not accept cookies, you may not be able to use some features of our application.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              Our application is not intended for use by children under the age of 18. We do not knowingly collect personal 
              information from children. If you are a parent or guardian and believe your child has provided us with personal 
              information, please contact us so we can delete such information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy 
              Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="list-none space-y-2 mt-2">
              <li><strong>Email:</strong> Solutions.businessplus@gmail.com</li>
              <li><strong>Website:</strong> www.businessplus.in</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
