import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createWorkOrder } from '@/db/workOrder';
import { getMyCustomers } from '@/db/api';
import type { WorkOrderForm, Customer } from '@/types';

export default function CreateWorkOrderPage() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const navigate = useNavigate();

  const form = useForm<WorkOrderForm>({
    defaultValues: {
      company_name: '',
      customer_id: '',
      job_name: '',
      rate_per_piece: 0,
      total_value: 0,
      quantity_ordered: 0,
      quantity_returned: 0,
      work_start_date: new Date().toISOString().split('T')[0],
      completion_date: '',
      status: 'pending',
      notes: '',
    },
  });

  useEffect(() => {
    const loadCustomers = async () => {
      const customerList = await getMyCustomers();
      setCustomers(customerList);
    };
    loadCustomers();
  }, []);

  // Auto-fill company name when customer is selected
  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find((c) => c.id === customerId);
    if (selectedCustomer) {
      form.setValue('company_name', selectedCustomer.company_name);
    }
  };

  const onSubmit = async (data: WorkOrderForm) => {
    setLoading(true);
    try {
      const workOrder = await createWorkOrder(data);
      if (workOrder) {
        toast.success('Work order created successfully!');
        navigate('/work-orders');
      } else {
        toast.error('Failed to create work order');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create work order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Work Order</h1>
          <p className="text-muted-foreground">Add a new work order to track</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
          <CardDescription>Fill in the work order information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer (Optional)</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleCustomerChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company Name */}
                <FormField
                  control={form.control}
                  name="company_name"
                  rules={{ required: 'Company name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Job Name */}
                <FormField
                  control={form.control}
                  name="job_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Round Bar, Steel Plate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rate Per Piece */}
                <FormField
                  control={form.control}
                  name="rate_per_piece"
                  rules={{
                    min: { value: 0, message: 'Rate must be positive' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Per Piece (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Value */}
                <FormField
                  control={form.control}
                  name="total_value"
                  rules={{
                    required: 'Total value is required',
                    min: { value: 0, message: 'Total value must be positive' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Value (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantity Ordered */}
                <FormField
                  control={form.control}
                  name="quantity_ordered"
                  rules={{
                    required: 'Quantity ordered is required',
                    min: { value: 0, message: 'Quantity must be positive' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Ordered *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantity Returned */}
                <FormField
                  control={form.control}
                  name="quantity_returned"
                  rules={{
                    min: { value: 0, message: 'Quantity must be positive' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Returned</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work Start Date */}
                <FormField
                  control={form.control}
                  name="work_start_date"
                  rules={{ required: 'Work start date is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Completion Date */}
                <FormField
                  control={form.control}
                  name="completion_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes or comments..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Work Order'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/work-orders')}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
