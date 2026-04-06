import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getMyWorkLogs, createWorkLog, updateWorkLog, deleteWorkLog, getWorkSummary } from '@/db/api';
import { getActiveWorkOrders } from '@/db/workOrder';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Factory, Building2, Briefcase, Info } from 'lucide-react';
import type { WorkLog, WorkLogForm, WorkOrder } from '@/types';

export default function WorkTrackingPage() {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [summary, setSummary] = useState<any>(null);

  const form = useForm<WorkLogForm>({
    defaultValues: {
      log_date: new Date().toISOString().split('T')[0],
      work_type: 'inhouse',
      company_name: '',
      machine_hours: 0,
      jobs_completed: 0,
      notes: '',
      work_order_id: '',
      quantity_completed: 0,
    },
  });

  useEffect(() => {
    loadWorkLogs();
    loadSummary();
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      const data = await getActiveWorkOrders();
      setWorkOrders(data);
    } catch (error) {
      console.error('Failed to load work orders:', error);
    }
  };

  const loadWorkLogs = async () => {
    try {
      const data = await getMyWorkLogs();
      setWorkLogs(data);
    } catch (error) {
      console.error('Failed to load work logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      const data = await getWorkSummary(firstDay, lastDay);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const onSubmit = async (data: WorkLogForm) => {
    try {
      if (editingLog) {
        await updateWorkLog(editingLog.id, data);
        toast.success('Work log updated successfully');
      } else {
        await createWorkLog(data);
        toast.success('Work log created successfully');
      }
      setDialogOpen(false);
      form.reset();
      setEditingLog(null);
      loadWorkLogs();
      loadSummary();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save work log');
    }
  };

  const handleEdit = (log: WorkLog) => {
    setEditingLog(log);
    
    // Find the work order if linked
    const linkedOrder = workOrders.find(wo => wo.id === log.work_order_id);
    if (linkedOrder) {
      setSelectedWorkOrder(linkedOrder);
    }
    
    form.reset({
      log_date: log.log_date,
      work_type: log.work_type,
      company_name: log.company_name,
      machine_hours: log.machine_hours,
      jobs_completed: log.jobs_completed,
      notes: log.notes || '',
      work_order_id: log.work_order_id || '',
      quantity_completed: log.quantity_completed || 0,
    });
    setDialogOpen(true);
  };

  const handleWorkOrderChange = (workOrderId: string) => {
    if (workOrderId === 'none') {
      setSelectedWorkOrder(null);
      form.setValue('work_order_id', '');
      return;
    }
    
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    if (workOrder) {
      setSelectedWorkOrder(workOrder);
      form.setValue('company_name', workOrder.company_name);
      form.setValue('work_order_id', workOrderId);
    } else {
      setSelectedWorkOrder(null);
      form.setValue('work_order_id', '');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    form.reset({
      log_date: new Date().toISOString().split('T')[0],
      work_type: 'inhouse',
      company_name: '',
      machine_hours: 0,
      jobs_completed: 0,
      notes: '',
      work_order_id: '',
      quantity_completed: 0,
    });
    setEditingLog(null);
    setSelectedWorkOrder(null);
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this work log?')) return;

    try {
      await deleteWorkLog(logId);
      toast.success('Work log deleted');
      loadWorkLogs();
      loadSummary();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete work log');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48 bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 bg-muted" />
          ))}
        </div>
        <Skeleton className="h-96 bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Work Tracking</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLog(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Work Log
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLog ? 'Edit Work Log' : 'Add Work Log'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="log_date"
                    rules={{ required: 'Date is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="work_type"
                    rules={{ required: 'Work type is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="inhouse">Inhouse</SelectItem>
                            <SelectItem value="outsource">Outsource</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Work Order Selection */}
                <FormField
                  control={form.control}
                  name="work_order_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Work Order (Optional)</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleWorkOrderChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {workOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              {order.work_order_number} - {order.company_name} ({order.job_name || 'No job name'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work Order Details Card */}
                {selectedWorkOrder && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Work Order Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Order Number:</span>
                          <p className="font-medium">{selectedWorkOrder.work_order_number}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Job Name:</span>
                          <p className="font-medium">{selectedWorkOrder.job_name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quantity Ordered:</span>
                          <p className="font-medium">{selectedWorkOrder.quantity_ordered}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pending:</span>
                          <p className="font-medium text-primary">
                            {(selectedWorkOrder as any).quantity_pending || selectedWorkOrder.outstanding_quantity}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rate:</span>
                          <p className="font-medium">₹{selectedWorkOrder.rate_per_piece}/piece</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-medium capitalize">{selectedWorkOrder.status.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <FormField
                  control={form.control}
                  name="company_name"
                  rules={{ required: 'Company name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter company name" disabled={!!selectedWorkOrder} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantity Completed (only show if work order is selected) */}
                {selectedWorkOrder && (
                  <FormField
                    control={form.control}
                    name="quantity_completed"
                    rules={{
                      required: 'Quantity completed is required',
                      min: { value: 0, message: 'Must be at least 0' },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity Completed Today</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          <Info className="h-3 w-3 inline mr-1" />
                          Pending quantity will be automatically updated
                        </p>
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="machine_hours"
                    rules={{
                      required: 'Machine hours is required',
                      min: { value: 0, message: 'Must be at least 0' },
                      max: { value: 24, message: 'Cannot exceed 24 hours' },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Machine Hours (out of 24)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            placeholder="0.0"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobs_completed"
                    rules={{ required: 'Jobs completed is required', min: { value: 0, message: 'Must be at least 0' } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jobs Completed</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            placeholder="0"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter any additional notes" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingLog ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Inhouse Hours (This Month)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">{summary.total_inhouse_hours.toFixed(1)}h</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Outsource Hours (This Month)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">{summary.total_outsource_hours.toFixed(1)}h</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Jobs (This Month)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.total_jobs}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Logs (This Month)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.total_logs}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Work Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {workLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No work logs yet</p>
              <Button onClick={() => setDialogOpen(true)}>Add Your First Work Log</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Work Type</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead className="text-right">Machine Hours</TableHead>
                  <TableHead className="text-right">Jobs Completed</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{new Date(log.log_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={log.work_type === 'inhouse' ? 'default' : 'secondary'}>
                        {log.work_type === 'inhouse' ? (
                          <Building2 className="mr-1 h-3 w-3" />
                        ) : (
                          <Factory className="mr-1 h-3 w-3" />
                        )}
                        {log.work_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.company_name}</TableCell>
                    <TableCell className="text-right">{log.machine_hours.toFixed(1)}h / 24h</TableCell>
                    <TableCell className="text-right">{log.jobs_completed}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(log)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(log.id)}>
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
