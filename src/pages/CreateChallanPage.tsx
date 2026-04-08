import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { createChallan, getMyCustomers, checkSubscriptionStatus } from '@/db/api';
import { Loader2, Plus, Trash2, Crown } from 'lucide-react';
import type { DeliveryChallanForm, DeliveryChallanItemForm, Customer } from '@/types';

const purposeOptions = [
  { value: 'job_work', label: 'Job Work' },
  { value: 'return_after_job_work', label: 'Return after Job Work' },
  { value: 'repair', label: 'For Repair' },
  { value: 'sample', label: 'For Sample' },
  { value: 'branch_transfer', label: 'Branch Transfer' },
];

export default function CreateChallanPage() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [hasPremium, setHasPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const navigate = useNavigate();

  const form = useForm<DeliveryChallanForm>({
    defaultValues: {
      challan_date: new Date().toISOString().split('T')[0],
      place_of_supply: '',
      party_name: '',
      party_address: '',
      party_gst: '',
      party_state: '',
      purpose: 'job_work',
      items: [
        {
          item_name: '',
          description: '',
          hsn_code: '',
          quantity: 1,
          unit: 'Nos',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    checkPremium();
    loadCustomers();
  }, []);

  const checkPremium = async () => {
    try {
      const premium = await checkSubscriptionStatus();
      setHasPremium(premium);
      
      // If not premium, redirect to subscription page
      if (!premium) {
        toast.error('Delivery Challan is a premium feature');
        navigate('/subscription');
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
      navigate('/subscription');
    } finally {
      setCheckingPremium(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await getMyCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      form.setValue('party_name', customer.company_name);
      form.setValue('party_address', customer.address || '');
      form.setValue('party_gst', customer.gst_number || '');
    }
  };

  const onSubmit = async (data: DeliveryChallanForm) => {
    if (data.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const challan = await createChallan(data);
      toast.success('Delivery challan created successfully');
      navigate(`/delivery-challans/${challan.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create delivery challan');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking premium status
  if (checkingPremium) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not premium, show upgrade prompt (shouldn't reach here due to redirect, but safety check)
  if (!hasPremium) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create Delivery Challan</h1>
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <Crown className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-100">Premium Feature</AlertTitle>
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Delivery Challan is available only for paid subscribers.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1 text-orange-600 hover:text-orange-700"
              onClick={() => navigate('/subscription')}
            >
              Upgrade now
            </Button> to unlock this feature.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Delivery Challan</h1>
        <Button variant="outline" onClick={() => navigate('/delivery-challans')}>
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Party Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Selection */}
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select Party (Optional)
                </label>
                <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select from saved customers" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="party_name"
                  rules={{ required: 'Party name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Party Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter party name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="challan_date"
                  rules={{ required: 'Challan date is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challan Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="party_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter party address" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="party_gst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Party GSTIN</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter GSTIN" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="party_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Party State</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="place_of_supply"
                  rules={{ required: 'Place of supply is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Supply *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter place" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="purpose"
                rules={{ required: 'Purpose is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Delivery *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purposeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      item_name: '',
                      description: '',
                      hsn_code: '',
                      quantity: 1,
                      unit: 'Nos',
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Item Name</TableHead>
                    <TableHead className="w-[250px]">Description</TableHead>
                    <TableHead className="w-[120px]">HSN/SAC</TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
                    <TableHead className="w-[100px]">Unit</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.item_name`}
                          rules={{ required: 'Required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="Item name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="Description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.hsn_code`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="HSN/SAC" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          rules={{ required: 'Required', min: { value: 0.01, message: 'Must be > 0' } }}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="Unit" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/delivery-challans')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Delivery Challan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
