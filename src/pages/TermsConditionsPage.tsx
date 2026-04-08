import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsAndConditionsPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Terms and Conditions</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              By accessing and using BusinessPlus ("the Service"), you agree to be bound by these Terms and Conditions. 
              If you do not agree with any part of these terms, you may not use our Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              BusinessPlus is an internal billing and operations management platform that provides:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Bill creation and management with GST compliance</li>
              <li>Purchase order creation and tracking</li>
              <li>Delivery challan generation</li>
              <li>Stock management and inventory tracking</li>
              <li>Customer and supplier management</li>
              <li>Work order and work tracking features</li>
              <li>Sales and purchase reporting with analytics</li>
              <li>User management and role-based access control</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Accounts and Registration</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Account Creation</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must provide accurate, complete, and current information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized access to your account</li>
                <li>You are responsible for all activities that occur under your account</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Account Types</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Admin Users:</strong> Full access to all features including user management</li>
                <li><strong>Regular Users:</strong> Access to billing, purchasing, and operational features</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Account Termination</h3>
              <p>We reserve the right to suspend or terminate your account if you:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violate these Terms and Conditions</li>
                <li>Provide false or misleading information</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Abuse or misuse the Service</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Isolation and Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <ul className="list-disc pl-6 space-y-1">
              <li>Each user operates within their own isolated company environment</li>
              <li>Your data (bills, purchase orders, stock, customers) is strictly private and not visible to other users</li>
              <li>We implement row-level security to ensure data isolation</li>
              <li>You retain ownership of all data you create in the system</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acceptable Use Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>Transmit any viruses, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems (bots, scrapers) without permission</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription and Payment</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Free and Premium Plans</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Free Plan:</strong> Basic features with watermark on printed documents</li>
                <li><strong>Premium Plan:</strong> Full features without watermark and additional capabilities</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Payment Terms</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Premium subscriptions are billed monthly or annually</li>
                <li>Payments are processed securely through our payment provider</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change pricing with 30 days' notice</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Cancellation</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>You may cancel your subscription at any time</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
                <li>You will retain access to premium features until the end of the paid period</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              The Service and its original content, features, and functionality are owned by BusinessPlus and are protected 
              by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>You may not copy, modify, distribute, or create derivative works</li>
              <li>You may not remove or alter any copyright notices</li>
              <li>Your data remains your property, but you grant us a license to use it to provide the Service</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disclaimer of Warranties</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
              INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
              <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
              <li>Warranties regarding the accuracy or reliability of any information obtained through the Service</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUSINESSPLUS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or data loss</li>
              <li>Errors or inaccuracies in the Service</li>
              <li>Unauthorized access to your data</li>
            </ul>
            <p className="mt-2">
              Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              You agree to indemnify and hold harmless BusinessPlus and its officers, directors, employees, and agents from 
              any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms and Conditions</li>
              <li>Your violation of any rights of another party</li>
              <li>Your data or content submitted through the Service</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Backup and Loss</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              While we implement regular backups and security measures, you are responsible for maintaining your own backups 
              of critical data. We are not liable for any data loss, corruption, or unavailability.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modifications to Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time with or 
              without notice. We shall not be liable to you or any third party for any modification, suspension, or 
              discontinuance of the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governing Law and Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India, without 
              regard to its conflict of law provisions. Any disputes arising from these terms shall be subject to the 
              exclusive jurisdiction of the courts in [Your City], India.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severability</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions 
              shall continue in full force and effect.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>
              We reserve the right to update these Terms and Conditions at any time. We will notify you of any changes by 
              posting the new terms on this page and updating the "Last updated" date. Your continued use of the Service 
              after changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none">
            <p>If you have any questions about these Terms and Conditions, please contact us:</p>
            <ul className="list-none space-y-2 mt-2">
              <li><strong>Email:</strong> support@businessplus.com</li>
              <li><strong>Website:</strong> www.businessplus.in</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
