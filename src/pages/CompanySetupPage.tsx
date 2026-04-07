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
import { Loader2 } from 'lucide-react';

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
      ifsc_code: '',
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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Company Setup</CardTitle>
          <CardDescription>
            {existingCompany
              ? 'Update your company details and GST information'
              : 'Set up your company details to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Bank Details</h3>
                
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

              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  {form.watch('logo_url') && (
                    <img
                      src={form.watch('logo_url') || ''}
                      alt="Company Logo"
                      className="h-16 w-16 object-contain border rounded"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                </div>
                {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
              </div>

              {/* Data Security Policy Checkbox - Only for new company setup */}
              {!existingCompany && (
                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <input
                    type="checkbox"
                    id="agreeDataSecurity"
                    checked={agreeToDataSecurity}
                    onChange={(e) => setAgreeToDataSecurity(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                  />
                  <label htmlFor="agreeDataSecurity" className="text-sm">
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

              <div className="flex gap-2">
                <Button type="submit" disabled={loading || uploading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {existingCompany ? 'Update Company' : 'Complete Setup'}
                </Button>
                {existingCompany && (
                  <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
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
