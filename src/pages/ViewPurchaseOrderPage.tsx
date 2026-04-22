import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPurchaseOrderById } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import type { PurchaseOrderWithItems } from '@/types';

export default function ViewPurchaseOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [po, setPO] = useState<PurchaseOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadPO();
    }
  }, [id]);

  const loadPO = async () => {
    try {
      const poData = await getPurchaseOrderById(id!);
      setPO(poData);
    } catch (error) {
      console.error('Failed to load purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32 bg-muted" />
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Purchase order not found</p>
        <Button onClick={() => navigate('/purchase-orders')}>Back to Purchase Orders</Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      revised: 'bg-blue-100 text-blue-800',
    };
    const color = statusColors[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => navigate('/purchase-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Purchase Orders
        </Button>
        <Button onClick={() => navigate(`/purchase-orders/${id}/edit`)}>
          Edit Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Purchase Order Details</CardTitle>
            {po.status && getStatusBadge(po.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>HSN</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">CGST</TableHead>
                  <TableHead className="text-right">SGST</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {po.purchase_order_items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{po.supplier_name}</TableCell>
                    <TableCell>{po.invoice_no || '-'}</TableCell>
                    <TableCell>{item.hsn_code || '-'}</TableCell>
                    <TableCell>{new Date(po.po_date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.unit_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">₹{item.line_total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {item.cgst_rate}%<br />
                      <span className="text-sm text-muted-foreground">₹{item.cgst_amount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.sgst_rate}%<br />
                      <span className="text-sm text-muted-foreground">₹{item.sgst_amount.toFixed(2)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Section */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Subtotal:</span>
                <span>₹{po.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total CGST:</span>
                <span>₹{po.total_cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total SGST:</span>
                <span>₹{po.total_sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{po.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
