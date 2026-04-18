import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Eye, Trash2, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getWorkOrders, deleteWorkOrder } from '@/db/workOrder';
import type { WorkOrder } from '@/types';

export default function WorkOrderListPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const loadWorkOrders = async () => {
    setLoading(true);
    const orders = await getWorkOrders();
    setWorkOrders(orders);
    setFilteredOrders(orders);
    setLoading(false);
  };

  useEffect(() => {
    loadWorkOrders();
  }, []);

  useEffect(() => {
    let filtered = workOrders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.work_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, workOrders]);

  const handleDelete = async (id: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete work order ${orderNumber}?`)) {
      return;
    }

    const success = await deleteWorkOrder(id);
    if (success) {
      toast.success('Work order deleted successfully');
      loadWorkOrders();
    } else {
      toast.error('Failed to delete work order');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      in_progress: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Work Orders</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage and track all work orders</p>
        </div>
        <Button onClick={() => navigate('/work-orders/create')} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Work Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
          <CardDescription>View and manage your work orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading work orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No work orders found matching your filters'
                  : 'No work orders yet'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => navigate('/work-orders/create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Work Order
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Order Number</TableHead>
                    <TableHead className="whitespace-nowrap">Company Name</TableHead>
                    <TableHead className="whitespace-nowrap">Job Name</TableHead>
                    <TableHead className="whitespace-nowrap">Rate/Piece</TableHead>
                    <TableHead className="whitespace-nowrap">Qty Ordered</TableHead>
                    <TableHead className="whitespace-nowrap">Qty Completed</TableHead>
                    <TableHead className="whitespace-nowrap">Pending</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium whitespace-nowrap">{order.work_order_number}</TableCell>
                      <TableCell className="whitespace-nowrap">{order.company_name}</TableCell>
                      <TableCell className="whitespace-nowrap">{order.job_name || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">₹{order.rate_per_piece.toLocaleString()}</TableCell>
                      <TableCell className="whitespace-nowrap">{order.quantity_ordered}</TableCell>
                      <TableCell className="text-green-600 font-semibold whitespace-nowrap">
                        {(order as any).quantity_completed || 0}
                      </TableCell>
                      <TableCell className="font-semibold text-primary whitespace-nowrap">
                        {(order as any).quantity_pending !== undefined 
                          ? (order as any).quantity_pending 
                          : order.outstanding_quantity}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/work-orders/${order.id}`)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(order.id, order.work_order_number)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrders.filter((o) => o.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrders.filter((o) => o.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrders.filter((o) => o.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
