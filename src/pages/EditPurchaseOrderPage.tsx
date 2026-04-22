import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { getPurchaseOrderById, updatePurchaseOrder, getMySuppliers } from '@/db/api';
import type { PurchaseOrderForm, PurchaseOrderWithItems, Supplier } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPurchaseOrderPage() {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const form = useForm<PurchaseOrderForm>({
    defaultValues: {
      supplier_name: '',
      supplier_contact: '',
      supplier_address: '',
      supplier_gst_number: '',
      invoice_no: '',
      po_date: new Date().toISOString().split('T')[0],
      classification: 'expense',
      gst_type: 'cgst_sgst',
      items: [
        {
          item_name: '',
          hsn_code: '',
          quantity: 1,
          unit_price: 0,
          cgst_rate: 9,
          sgst_rate: 9,
          igst_rate: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        toast.error('Purchase Order ID not found');
        navigate('/purchase-orders');
        return;
      }

      try {
        // Load suppliers
        const supplierList = await getMySuppliers();
        setSuppliers(supplierList);

        // Load purchase order
        const po = await getPurchaseOrderById(id);
        if (!po) {
          toast.error('Purchase order not found');
          navigate('/purchase-orders');
          return;
        }

        // Determine GST type from items
        const gstType = po.purchase_order_items.some(item => item.igst_amount > 0) ? 'igst' : 'cgst_sgst';

        // Populate form with purchase order data
        form.reset({
          supplier_name: po.supplier_name,
          supplier_contact: po.supplier_contact || '',
          supplier_address: po.supplier_address || '',
          supplier_gst_number: po.supplier_gst_number || '',
          invoice_no: po.invoice_no || '',
          po_date: po.po_date,
          classification: po.classification,
          gst_type: gstType,
          items: po.purchase_order_items.map(item => ({
            item_name: item.item_name,
            hsn_code: item.hsn_code || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            cgst_rate: item.cgst_rate,
            sgst_rate: item.sgst_rate,
            igst_rate: gstType === 'igst' ? 18 : 0,
          })),
        });
      } catch (error: any) {
        toast.error(error.message || 'Failed to load purchase order');
        navigate('/purchase-orders');
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [id, navigate, form]);

  const calculateLineTotal = (item: any) => {
    const gstType = form.watch('gst_type');
    const subtotal = item.quantity * item.unit_price;
    
    if (gstType === 'cgst_sgst') {
      const cgst = (subtotal * item.cgst_rate) / 100;
      const sgst = (subtotal * item.sgst_rate) / 100;
      return subtotal + cgst + sgst;
    } else {
      const igst = (subtotal * item.igst_rate) / 100;
      return subtotal + igst;
    }
  };

  const calculateTotals = () => {
    const items = form.watch('items');
    const gstType = form.watch('gst_type');
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    items.forEach((item) => {
      const lineSubtotal = item.quantity * item.unit_price;
      subtotal += lineSubtotal;
      
      if (gstType === 'cgst_sgst') {
        totalCgst += (lineSubtotal * item.cgst_rate) / 100;
        totalSgst += (lineSubtotal * item.sgst_rate) / 100;
      } else {
        totalIgst += (lineSubtotal * item.igst_rate) / 100;
      }
    });

    const gstTotal = gstType === 'cgst_sgst' ? totalCgst + totalSgst : totalIgst;
    return {
      subtotal,
      totalCgst,
      totalSgst,
      totalIgst,
      grandTotal: subtotal + gstTotal,
    };
  };

  const handleGstTypeChange = (gstType: 'cgst_sgst' | 'igst') => {
    form.setValue('gst_type', gstType);
    const items = form.getValues('items');
    
    items.forEach((_, index) => {
      if (gstType === 'cgst_sgst') {
        form.setValue(`items.${index}.cgst_rate`, 9);
        form.setValue(`items.${index}.sgst_rate`, 9);
        form.setValue(`items.${index}.igst_rate`, 0);
      } else {
        form.setValue(`items.${index}.cgst_rate`, 0);
        form.setValue(`items.${index}.sgst_rate`, 0);
        form.setValue(`items.${index}.igst_rate`, 18);
      }
    });
  };

  const totals = calculateTotals();

  const onSubmit = async (data: PurchaseOrderForm) => {
    if (!id) return;

    if (data.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      await updatePurchaseOrder(id, data);
      toast.success('Purchase order updated successfully! Status changed to "Revised"');
      navigate(`/purchase-orders/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update purchase order');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="space-y-6 px-4 md:px-0">
        <Skeleton className="h-8 w-48 bg-muted" />
        <Skeleton className="h-80 bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-0">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/purchase-orders/${id}`)} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Purchase Order</h1>
          <p className="text-sm text-muted-foreground">Update purchase order details. Status will be changed to "Revised"</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier_name"
                  rules={{ required: 'Supplier name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name *</FormLabel>
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
                      <FormLabel>PO Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classification"
                  rules={{ required: 'Classification is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Classification *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select classification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="stock">Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoice_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter supplier invoice number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GST Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="gst_type"
                rules={{ required: 'GST type is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Type</FormLabel>
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="cgst_sgst"
                          value="cgst_sgst"
                          checked={field.value === 'cgst_sgst'}
                          onChange={() => handleGstTypeChange('cgst_sgst')}
                          className="w-4 h-4"
                        />
                        <label htmlFor="cgst_sgst" className="text-sm cursor-pointer">
                          CGST (9%) + SGST (9%)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="igst"
                          value="igst"
                          checked={field.value === 'igst'}
                          onChange={() => handleGstTypeChange('igst')}
                          className="w-4 h-4"
                        />
                        <label htmlFor="igst" className="text-sm cursor-pointer">
                          IGST (18%)
                        </label>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Line Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const gstType = form.getValues('gst_type');
                  append({
                    item_name: '',
                    hsn_code: '',
                    quantity: 1,
                    unit_price: 0,
                    cgst_rate: gstType === 'cgst_sgst' ? 9 : 0,
                    sgst_rate: gstType === 'cgst_sgst' ? 9 : 0,
                    igst_rate: gstType === 'igst' ? 18 : 0,
                  });
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {/* Desktop: Table layout */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Item Name</TableHead>
                      <TableHead className="min-w-[100px]">HSN Code</TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-32">Unit Price</TableHead>
                      {form.watch('gst_type') === 'cgst_sgst' ? (
                        <>
                          <TableHead className="w-24">CGST %</TableHead>
                          <TableHead className="w-24">SGST %</TableHead>
                        </>
                      ) : (
                        <TableHead className="w-24">IGST %</TableHead>
                      )}
                      <TableHead className="text-right w-28">Total</TableHead>
                      <TableHead className="w-16"></TableHead>
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
                                    <Input {...field} placeholder="Item name" className="h-8" />
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
                                    <Input {...field} placeholder="HSN" className="h-8" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              rules={{ required: 'Required' }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      className="h-8"
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
                              rules={{ required: 'Required' }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      className="h-8"
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          {form.watch('gst_type') === 'cgst_sgst' ? (
                            <>
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
                                          className="h-8"
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
                                          className="h-8"
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                            </>
                          ) : (
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.igst_rate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        className="h-8"
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          )}
                          <TableCell className="text-right font-semibold">
                            ₹{lineTotal.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="h-8 w-8"
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
            </CardContent>
          </Card>

          {/* Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Subtotal:</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {form.watch('gst_type') === 'cgst_sgst' ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Total CGST:</span>
                        <span>₹{totals.totalCgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Total SGST:</span>
                        <span>₹{totals.totalSgst.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total IGST:</span>
                      <span>₹{totals.totalIgst.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Grand Total:</span>
                    <span>₹{totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/purchase-orders/${id}`)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Updating...' : 'Update Purchase Order'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
