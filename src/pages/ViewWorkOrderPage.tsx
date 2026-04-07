import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, FileText, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getWorkOrderById } from '@/db/workOrder';
import type { WorkOrderWithDetails, WorkLog } from '@/types';

export default function ViewWorkOrderPage() {
  const [workOrder, setWorkOrder] = useState<WorkOrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkOrder = async () => {
      if (!id) return;
      setLoading(true);
      const order = await getWorkOrderById(id);
      if (order) {
        setWorkOrder(order);
      } else {
        toast.error('Work order not found');
        navigate('/work-orders');
      }
      setLoading(false);
    };

    loadWorkOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8 text-muted-foreground">Loading work order...</div>
      </div>
    );
  }

  if (!workOrder) {
    return null;
  }

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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{workOrder.work_order_number}</h1>
            <p className="text-muted-foreground">{workOrder.company_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(workOrder.status)}
          <Button onClick={() => navigate(`/work-orders/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Work Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workOrder.job_name && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Job Name</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workOrder.job_name}</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rate Per Piece</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{workOrder.rate_per_piece.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{workOrder.total_value.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quantity Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrder.quantity_ordered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quantity Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {workOrder.quantity_completed || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quantity Returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrder.quantity_returned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {workOrder.quantity_pending !== undefined 
                ? workOrder.quantity_pending 
                : workOrder.outstanding_quantity}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Work Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(workOrder.work_start_date).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completion Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrder.completion_date
                ? new Date(workOrder.completion_date).toLocaleDateString()
                : 'Not set'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Track Integration */}
      {workOrder.work_logs && workOrder.work_logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Work Track Integration</CardTitle>
            <CardDescription>In-house work progress and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Completed Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workOrder.completed_tasks || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Remaining Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workOrder.remaining_tasks || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Work Logs Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Work Log Details</h3>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Work Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pictures</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrder.work_logs.map((log: WorkLog) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.log_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.work_type === 'inhouse' ? 'In-House' : 'Outsource'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.notes || 'No description'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            Completed
                          </Badge>
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{log.machine_hours || 0}h</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {workOrder.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{workOrder.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* No Work Logs Message */}
      {(!workOrder.work_logs || workOrder.work_logs.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Work Track Integration</CardTitle>
            <CardDescription>In-house work progress and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                No work logs linked to this work order yet
              </p>
              <Button onClick={() => navigate('/work-tracking')}>
                Go to Work Tracking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
