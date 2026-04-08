import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createBill, getMyCustomers, createCustomer, checkSubscriptionStatus } from '@/db/api';
import { Loader2, Plus, Trash2, UserPlus, Crown } from 'lucide-react';
import type { BillForm, BillItemForm, Customer } from '@/types';

export default function CreateBillPage() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [hasPremium, setHasPremium] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [showPoNumber, setShowPoNumber] = useState(false);
  const navigate = useNavigate();

  const form = useForm<BillForm>({
    defaultValues: {
      customer_name: '',
      customer_address: '',
      customer_gst_number: '',
      customer_email: '',
      bill_date: new Date().toISOString().split('T')[0],
      po_number: '',
      payment_status: 'pending',
      payment_reminder: 'none',
      items: [
        {
          item_name: '',
          hsn_code: '',
          quantity: 1,
          unit_price: 0,
          cgst_rate: 9,
          sgst_rate: 9,
        },
      ],
    },
  });

  const newCustomerForm = useForm({
    defaultValues: {
      company_name: '',
      gst_number: '',
      address: '',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
    },
  });

  useEffect(() => {
    loadCustomers();
    checkPremium();
  }, []);

  const checkPremium = async () => {
    try {
      const premium = await checkSubscriptionStatus();
      setHasPremium(premium);
    } catch (error) {
      console.error('Failed to check subscription:', error);
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
      form.setValue('customer_name', customer.company_name);
      form.setValue('customer_address', customer.address || '');
      form.setValue('customer_gst_number', customer.gst_number || '');
      form.setValue('customer_email', customer.contact_email || '');
    }
  };

  const handleAddNewCustomer = async (data: any) => {
    try {
      const newCustomer = await createCustomer(data);
      toast.success('Customer added successfully');
      setCustomers([...customers, newCustomer]);
      setShowNewCustomerDialog(false);
      newCustomerForm.reset();
      handleCustomerSelect(newCustomer.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add customer');
    }
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const calculateLineTotal = (item: BillItemForm) => {
    const subtotal = item.quantity * item.unit_price;
    const cgst = (subtotal * item.cgst_rate) / 100;
    const sgst = (subtotal * item.sgst_rate) / 100;
    return subtotal + cgst + sgst;
  };

  const calculateTotals = () => {
    const items = form.watch('items');
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    items.forEach((item) => {
      const lineSubtotal = item.quantity * item.unit_price;
      subtotal += lineSubtotal;
      totalCgst += (lineSubtotal * item.cgst_rate) / 100;
      totalSgst += (lineSubtotal * item.sgst_rate) / 100;
    });

    return {
      subtotal,
      totalCgst,
      totalSgst,
      grandTotal: subtotal + totalCgst + totalSgst,
    };
  };

  const totals = calculateTotals();

  const onSubmit = async (data: BillForm) => {
    if (data.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const bill = await createBill(data);
      toast.success('Bill created successfully');
      navigate(`/bills/${bill.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Create Bill</h1>
        <Button variant="outline" onClick={() => navigate('/bills')} className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>

      {/* Add New Customer Dialog - Outside main form */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter customer details to add them to your list</DialogDescription>
          </DialogHeader>
          <Form {...newCustomerForm}>
            <form onSubmit={newCustomerForm.handleSubmit(handleAddNewCustomer)} className="space-y-4">
              <FormField
                control={newCustomerForm.control}
                name="company_name"
                rules={{ required: 'Company name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter company name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newCustomerForm.control}
                name="gst_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter GST number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newCustomerForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter address" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={newCustomerForm.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter contact person" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newCustomerForm.control}
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
              </div>
              <FormField
                control={newCustomerForm.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowNewCustomerDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Customer</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Selection Dropdown */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Select Customer
                  </label>
                  <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a customer or add new" />
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
                <Button type="button" variant="outline" className="sm:mt-6 w-full sm:w-auto" onClick={() => setShowNewCustomerDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  rules={{ required: 'Customer name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter customer name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bill_date"
                  rules={{ required: 'Bill date is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* P.O. Number Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-po-number"
                    checked={showPoNumber}
                    onChange={(e) => {
                      setShowPoNumber(e.target.checked);
                      if (!e.target.checked) {
                        form.setValue('po_number', '');
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="show-po-number" className="text-sm font-medium">
                    Add P.O. Number
                  </label>
                </div>

                {showPoNumber && (
                  <FormField
                    control={form.control}
                    name="po_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>P.O. Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter purchase order number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="customer_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter customer address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_gst_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer GST Number (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter GST number" maxLength={15} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="customer@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Details</CardTitle>
                {!hasPremium && (
                  <Crown className="h-5 w-5 text-orange-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasPremium && (
                <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
                  <Crown className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-900 dark:text-orange-100">Premium Feature</AlertTitle>
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    Payment email automation is available only for paid subscribers. 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-1 text-orange-600 hover:text-orange-700"
                      onClick={() => navigate('/subscription')}
                    >
                      Upgrade now
                    </Button> to unlock automated payment reminders and confirmations.
                  </AlertDescription>
                </Alert>
              )}

              <div className={`grid gap-4 md:grid-cols-2 ${!hasPremium ? 'opacity-50 pointer-events-none' : ''}`}>
                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!hasPremium}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_reminder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Reminder</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!hasPremium}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reminder period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="7_days">7 Days</SelectItem>
                          <SelectItem value="30_days">30 Days</SelectItem>
                          <SelectItem value="45_days">45 Days</SelectItem>
                          <SelectItem value="90_days">90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )}
              />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    item_name: '',
                    hsn_code: '',
                    quantity: 1,
                    unit_price: 0,
                    cgst_rate: 9,
                    sgst_rate: 9,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Item Name</TableHead>
                        <TableHead className="min-w-[100px]">HSN Code</TableHead>
                        <TableHead className="w-24 min-w-[80px]">Qty</TableHead>
                        <TableHead className="w-32 min-w-[100px]">Unit Price</TableHead>
                        <TableHead className="w-24 min-w-[80px]">CGST %</TableHead>
                        <TableHead className="w-24 min-w-[80px]">SGST %</TableHead>
                        <TableHead className="text-right min-w-[100px]">Total</TableHead>
                        <TableHead className="w-16 min-w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const item = form.watch(`items.${index}`);
                      const lineTotal = calculateLineTotal(item);

                      return (
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
                                    <Input {...field} placeholder="HSN" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              rules={{ required: 'Required', min: { value: 0.01, message: 'Min 0.01' } }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.unit_price`}
                              rules={{ required: 'Required', min: { value: 0, message: 'Min 0' } }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.cgst_rate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.sgst_rate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">₹{lineTotal.toFixed(2)}</TableCell>
                          <TableCell>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total CGST:</span>
                    <span className="font-medium">₹{totals.totalCgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total SGST:</span>
                    <span className="font-medium">₹{totals.totalSgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Grand Total:</span>
                    <span>₹{totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/bills')} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Bill
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
