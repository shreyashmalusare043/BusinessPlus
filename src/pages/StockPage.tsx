import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { getMyStockItems, createStockItem, updateStockItem, deleteStockItem } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { StockItem, StockItemForm } from '@/types';

export default function StockPage() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);

  const form = useForm<StockItemForm>({
    defaultValues: {
      item_name: '',
      hsn_code: '',
      quantity: 0,
      unit: 'pcs',
      low_stock_threshold: 10,
    },
  });

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const data = await getMyStockItems();
      setStocks(data);
    } catch (error) {
      console.error('Failed to load stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (stock?: StockItem) => {
    if (stock) {
      setEditingStock(stock);
      form.reset({
        item_name: stock.item_name,
        hsn_code: stock.hsn_code || '',
        quantity: stock.quantity,
        unit: stock.unit,
        low_stock_threshold: stock.low_stock_threshold,
      });
    } else {
      setEditingStock(null);
      form.reset({
        item_name: '',
        hsn_code: '',
        quantity: 0,
        unit: 'pcs',
        low_stock_threshold: 10,
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = async (data: StockItemForm) => {
    try {
      if (editingStock) {
        await updateStockItem(editingStock.id, data);
        toast.success('Stock item updated');
      } else {
        await createStockItem(data);
        toast.success('Stock item created');
      }
      setDialogOpen(false);
      loadStocks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save stock item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stock item?')) return;

    try {
      await deleteStockItem(id);
      toast.success('Stock item deleted');
      loadStocks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete stock item');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32 bg-muted" />
          <Skeleton className="h-10 w-32 bg-muted" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24 bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stock Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStock ? 'Edit Stock Item' : 'Add Stock Item'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="item_name"
                  rules={{ required: 'Item name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter item name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hsn_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter HSN code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    rules={{ required: 'Quantity is required', min: { value: 0, message: 'Min 0' } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    rules={{ required: 'Unit is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., pcs, kg, ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="low_stock_threshold"
                  rules={{ required: 'Threshold is required', min: { value: 0, message: 'Min 0' } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Threshold</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingStock ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          {stocks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No stock items yet</p>
              <Button onClick={() => handleOpenDialog()}>Add Your First Stock Item</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>HSN Code</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Low Stock Alert</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => {
                  const isLowStock = stock.quantity <= stock.low_stock_threshold;
                  return (
                    <TableRow key={stock.id} className={isLowStock ? 'bg-destructive/10' : ''}>
                      <TableCell className="font-medium">
                        {stock.item_name}
                        {isLowStock && <AlertTriangle className="inline ml-2 h-4 w-4 text-destructive" />}
                      </TableCell>
                      <TableCell>{stock.hsn_code || '-'}</TableCell>
                      <TableCell className={`text-right ${isLowStock ? 'text-destructive font-bold' : ''}`}>
                        {stock.quantity}
                      </TableCell>
                      <TableCell>{stock.unit}</TableCell>
                      <TableCell className="text-right">{stock.low_stock_threshold}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDialog(stock)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(stock.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
