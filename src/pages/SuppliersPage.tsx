import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getMySuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import type { Supplier } from '@/types';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const navigate = useNavigate();

  const form = useForm({
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
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      form.reset({
        company_name: supplier.company_name,
        gst_number: supplier.gst_number || '',
        address: supplier.address || '',
        contact_person: supplier.contact_person || '',
        contact_phone: supplier.contact_phone || '',
        contact_email: supplier.contact_email || '',
      });
    } else {
      setEditingSupplier(null);
      form.reset({
        company_name: '',
        gst_number: '',
        address: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
        toast.success('Supplier updated successfully');
      } else {
        await createSupplier(data);
        toast.success('Supplier created successfully');
      }
      setDialogOpen(false);
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save supplier');
    }
  };

  const handleDelete = async (supplierId: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      await deleteSupplier(supplierId);
      toast.success('Supplier deleted successfully');
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete supplier');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48 bg-muted" />
          <Skeleton className="h-10 w-48 bg-muted" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-muted" />
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
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? 'Update supplier details' : 'Enter supplier details to add them to your list'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter address" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter contact person name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>

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

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSupplier ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No suppliers added yet</p>
              <Button onClick={() => handleOpenDialog()}>Add Your First Supplier</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.company_name}</TableCell>
                    <TableCell>{supplier.gst_number || 'N/A'}</TableCell>
                    <TableCell>{supplier.contact_person || 'N/A'}</TableCell>
                    <TableCell>{supplier.contact_phone || 'N/A'}</TableCell>
                    <TableCell>{supplier.contact_email || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
