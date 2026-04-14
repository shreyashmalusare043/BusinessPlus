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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createPurchaseOrder, getMySuppliers, createSupplier } from '@/db/api';
import { Loader2, Plus, Trash2, TruckIcon } from 'lucide-react';
import type { PurchaseOrderForm, PurchaseOrderItemForm, Supplier } from '@/types';

export default function CreatePurchaseOrderPage() {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const navigate = useNavigate();

  const form = useForm<PurchaseOrderForm>({
    defaultValues: {
      supplier_name: '',
      supplier_contact: '',
      supplier_address: '',
      supplier_gst_number: '',
      invoice_no: '',
      po_date: new Date().toISOString().split('T')[0],
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

  const newSupplierForm = useForm({
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
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await getMySuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const handleSupplierSelect = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (supplier) {
      form.setValue('supplier_name', supplier.company_name);
      form.setValue('supplier_address', supplier.address || '');
      form.setValue('supplier_gst_number', supplier.gst_number || '');
      form.setValue('supplier_contact', supplier.contact_phone || '');
    }
  };

  const handleAddNewSupplier = async (data: any) => {
    try {
      const newSupplier = await createSupplier(data);
      toast.success('Supplier added successfully');
      setSuppliers([...suppliers, newSupplier]);
      setShowNewSupplierDialog(false);
      newSupplierForm.reset();
      handleSupplierSelect(newSupplier.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add supplier');
    }
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const calculateLineTotal = (item: PurchaseOrderItemForm) => {
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

  const onSubmit = async (data: PurchaseOrderForm) => {
    if (data.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const po = await createPurchaseOrder(data);
      toast.success('Purchase order created successfully');
      navigate(`/purchase-orders/${po.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Create Purchase Order</h1>
        <Button variant="outline" onClick={() => navigate('/purchase-orders')} className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>

      {/* Add New Supplier Dialog - Outside main form */}
      <Dialog open={showNewSupplierDialog} onOpenChange={setShowNewSupplierDialog}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>Enter supplier details to add them to your list</DialogDescription>
          </DialogHeader>
          <Form {...newSupplierForm}>
            <form onSubmit={newSupplierForm.handleSubmit(handleAddNewSupplier)} className="space-y-4">
              <FormField
                control={newSupplierForm.control}
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
                control={newSupplierForm.control}
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
                control={newSupplierForm.control}
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
                  control={newSupplierForm.control}
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
                  control={newSupplierForm.control}
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
                control={newSupplierForm.control}
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
                <Button type="button" variant="outline" onClick={() => setShowNewSupplierDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Supplier</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supplier Selection Dropdown */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Select Supplier
                  </label>
                  <Select value={selectedSupplierId} onValueChange={handleSupplierSelect}>
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="Select a supplier or add new" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" className="sm:mt-6 w-full sm:w-auto" onClick={() => setShowNewSupplierDialog(true)}>
                  <TruckIcon className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier_name"
                  rules={{ required: 'Supplier name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter supplier name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="po_date"
                  rules={{ required: 'PO date is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoice_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter supplier's invoice number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter contact number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier_gst_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter GST number" maxLength={15} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter supplier address" />
                      </FormControl>
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
                <div className="inline-block min-w-full w-full align-middle">
                  <Table className="w-full">
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
            <Button type="button" variant="outline" onClick={() => navigate('/purchase-orders')} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Purchase Order
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
