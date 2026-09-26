import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { getMyCompany, createOrUpdateCompany } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { CompanyForm } from '@/types';
import { Building2, Landmark, Loader2, ShieldCheck } from 'lucide-react';

export default function CompanySetupPage() {
  const [loading, setLoading] = useState(false);
  const [existingCompany, setExistingCompany] = useState<any>(null);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [agreeToDataSecurity, setAgreeToDataSecurity] = useState(false);

  const form = useForm<CompanyForm>({
    defaultValues: {
      company_name: '',
      gst_number: '',
      address: '',
      contact_phone: '',
      contact_email: '',
      website: '',
      bank_name: '',
      account_holder_name: '',
      account_number: '',
      branch_name: '',
      logo_url: null,
    },
  });

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const company = await getMyCompany();
      if (company) {
        setExistingCompany(company);
        form.reset({
          company_name: company.company_name,
          gst_number: company.gst_number,
          address: company.address,
          contact_phone: company.contact_phone || '',
          contact_email: company.contact_email || '',
          website: company.website || '',
          bank_name: company.bank_name || '',
          account_holder_name: company.account_holder_name || '',
          account_number: company.account_number || '',
          ifsc_code: company.ifsc_code || '',
          branch_name: company.branch_name || '',
          logo_url: company.logo_url,
        });
      }
    } catch (error) {
      console.error('Failed to load company:', error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('aexewhy21fr5_company_logos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('aexewhy21fr5_company_logos')
        .getPublicUrl(fileName);

      form.setValue('logo_url', urlData.publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: CompanyForm) => {
    if (!existingCompany && !agreeToDataSecurity) {
      toast.error('Please agree to the Data Security Policy');
      return;
    }
    
    setLoading(true);
    try {
      await createOrUpdateCompany(data);
      toast.success(existingCompany ? 'Company details updated' : 'Company setup completed');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save company details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-start justify-center overflow-hidden bg-[linear-gradient(135deg,hsl(35_100%_97%)_0%,hsl(var(--background))_48%,hsl(24_95%_95%)_100%)] p-4 py-8 sm:p-8 dark:bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(20_28%_12%)_55%,hsl(24_45%_16%)_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(135deg,hsl(var(--primary)/.08)_25%,transparent_25%,transparent_50%,hsl(var(--primary)/.08)_50%,hsl(var(--primary)/.08)_75%,transparent_75%)] [background-size:36px_36px] dark:opacity-20" />
      <div className="pointer-events-none absolute -left-24 top-16 h-48 w-[130%] rotate-[-8deg] border-y border-primary/10 bg-white/20 dark:bg-white/[.02]" />
      <Card className="relative z-10 w-full max-w-4xl overflow-hidden border-0 shadow-2xl shadow-orange-950/10">
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 via-card to-card px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl">Company Settings</CardTitle>
          <CardDescription>
            {existingCompany
              ? 'Update your company details and GST information'
              : 'Set up your company details to get started'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 py-6 sm:px-8 sm:py-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="gst_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter 15-character GST number" 
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                rules={{ required: 'Company name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter company name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                rules={{ required: 'Address is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter company address" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter website URL (e.g., www.example.com)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-5 rounded-xl border bg-muted/20 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Bank details</h3>
                    <p className="text-sm text-muted-foreground">Used on invoices and payment documents.</p>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter bank name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_holder_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter account holder name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter account number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ifsc_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter IFSC code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="branch_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter branch name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3 rounded-xl border border-dashed p-5 sm:p-6">
                <div>
                  <Label className="text-base">Company logo</Label>
                  <p className="mt-1 text-sm text-muted-foreground">Upload a clear logo for your documents.</p>
                </div>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  {form.watch('logo_url') && (
                    <img
                      src={form.watch('logo_url') || ''}
                      alt="Company Logo"
                      className="h-20 w-20 rounded-lg border bg-white object-contain p-1"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="max-w-md bg-background"
                  />
                </div>
                {uploading && <p className="text-sm text-primary">Uploading logo...</p>}
              </div>

              {/* Data Security Policy Checkbox - Only for new company setup */}
              {!existingCompany && (
                <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <input
                    type="checkbox"
                    id="agreeDataSecurity"
                    checked={agreeToDataSecurity}
                    onChange={(e) => setAgreeToDataSecurity(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                  />
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <label htmlFor="agreeDataSecurity" className="text-sm leading-6">
                    I have read and agree to the{' '}
                    <a 
                      href="/data-security-policy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Data Security Policy
                    </a>
                    {' '}and understand how my company data will be stored and protected.
                  </label>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                <Button type="submit" disabled={loading || uploading} className="sm:min-w-40">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {existingCompany ? 'Update Company' : 'Complete Setup'}
                </Button>
                {existingCompany && (
                  <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="sm:min-w-28">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
