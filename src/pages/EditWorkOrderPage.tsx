import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { getWorkOrderById, updateWorkOrder } from '@/db/workOrder';
import { getMyCustomers } from '@/db/api';
import type { WorkOrderForm, Customer } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditWorkOrderPage() {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
    const loadData = async () => {
      if (!id) {
        toast.error('Work order ID not found');
        navigate('/work-orders');
        return;
      }

      try {
        // Load customers
        const customerList = await getMyCustomers();
        setCustomers(customerList);

        // Load work order
        const workOrder = await getWorkOrderById(id);
        if (!workOrder) {
          toast.error('Work order not found');
          navigate('/work-orders');
          return;
        }

        // Populate form with work order data
        form.reset({
          company_name: workOrder.company_name,
          customer_id: workOrder.customer_id || '',
          job_name: workOrder.job_name || '',
          rate_per_piece: workOrder.rate_per_piece || 0,
          total_value: workOrder.total_value,
          quantity_ordered: workOrder.quantity_ordered,
          quantity_returned: workOrder.quantity_returned,
          work_start_date: workOrder.work_start_date,
          completion_date: workOrder.completion_date || '',
          status: workOrder.status,
          notes: workOrder.notes || '',
        });
      } catch (error: any) {
        toast.error(error.message || 'Failed to load work order');
        navigate('/work-orders');
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [id, navigate, form]);

  // Auto-fill company name when customer is selected
  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find((c) => c.id === customerId);
    if (selectedCustomer) {
      form.setValue('company_name', selectedCustomer.company_name);
    }
  };

  const onSubmit = async (data: WorkOrderForm) => {
    if (!id) return;

    setLoading(true);
    try {
      const success = await updateWorkOrder(id, data);
      if (success) {
        toast.success('Work order updated successfully!');
        navigate(`/work-orders/${id}`);
      } else {
        toast.error('Failed to update work order');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update work order');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 bg-muted" />
        <Skeleton className="h-80 sm:h-96 bg-muted" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/work-orders/${id}`)} className="shrink-0">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Edit Work Order</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Update work order details</p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">Work Order Information</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Update the work order details below</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                          <SelectItem value="none">None</SelectItem>
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
                    min: { value: 1, message: 'Quantity must be at least 1' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Ordered *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    min: { value: 0, message: 'Quantity returned cannot be negative' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Returned</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                      <FormLabel>Completion Date (Optional)</FormLabel>
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
                  rules={{ required: 'Status is required' }}
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
                    <FormLabel className="text-sm sm:text-base">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any additional notes" 
                        rows={4} 
                        className="text-sm sm:text-base"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/work-orders/${id}`)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Work Order
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
