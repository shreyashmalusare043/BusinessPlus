import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createSupportTicket } from '@/db/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { HelpCircle, Mail, MessageSquare } from 'lucide-react';

export default function HelpPage() {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await createSupportTicket(data);
      
      // Call edge function to send email
      // Note: This would require setting up an edge function
      toast.success('Support ticket submitted successfully! Our team will contact you soon.');
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit support ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <HelpCircle className="h-16 w-16 mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-muted-foreground">
          Need assistance? Submit your query and our support team will get back to you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Request</CardTitle>
          <CardDescription>
            Describe your issue or question in detail, and we'll respond as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                rules={{ required: 'Subject is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description of your issue" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                rules={{ required: 'Message is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Please provide detailed information about your issue or question..."
                        rows={8}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Support Request'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Ways to Reach Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">Email Support</p>
              <p className="text-sm text-muted-foreground">solutions.businessplus@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">Response Time</p>
              <p className="text-sm text-muted-foreground">We typically respond within 24-48 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
