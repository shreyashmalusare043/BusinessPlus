import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getMyPurchaseOrders, getPurchaseOrdersByDateRange } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { PurchaseOrder } from '@/types';

export default function PurchaseOrderListPage() {
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPOs();
  }, []);

  const loadPOs = async () => {
    try {
      const data = await getMyPurchaseOrders();
      setPOs(data);
    } catch (error) {
      console.error('Failed to load purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setExportLoading(true);
    try {
      const posData = await getPurchaseOrdersByDateRange(startDate, endDate);

      if (posData.length === 0) {
        toast.info('No purchase orders found in the selected date range');
        setExportLoading(false);
        return;
      }

      // Get company details for the report header
      const { getMyCompany } = await import('@/db/api');
      const company = await getMyCompany();

      // Prepare data for Excel export
      const exportData = posData.flatMap(po =>
        po.purchase_order_items.map((item: any, index: number) => ({
          'Sr. No': index + 1,
          'PO No': po.po_no,
          'Supplier Invoice No': po.invoice_no || 'N/A',
          'PO Date': new Date(po.po_date).toLocaleDateString('en-IN'),
          'Supplier Name': po.supplier_name,
          'Supplier GSTIN': po.supplier_gst_number || 'N/A',
          'Supplier Contact': po.supplier_contact,
          'Supplier Address': po.supplier_address,
          'Item Description': item.item_name,
          'HSN/SAC Code': item.hsn_code,
          'Quantity': item.quantity,
          'Unit Price (₹)': item.unit_price.toFixed(2),
          'Taxable Value (₹)': (item.quantity * item.unit_price).toFixed(2),
          'CGST @ 9% (₹)': item.cgst_amount.toFixed(2),
          'SGST @ 9% (₹)': item.sgst_amount.toFixed(2),
          'Total GST (₹)': (item.cgst_amount + item.sgst_amount).toFixed(2),
          'Line Total (₹)': item.line_total.toFixed(2),
          'PO Grand Total (₹)': po.grand_total.toFixed(2),
        }))
      );

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      // Add title
      XLSX.utils.sheet_add_aoa(ws, [['MONTHLY PURCHASE ORDERS REPORT']], { origin: 'A1' });
      
      // Add company name and date range
      XLSX.utils.sheet_add_aoa(ws, [[`Company: ${company?.company_name || 'N/A'}`]], { origin: 'A2' });
      XLSX.utils.sheet_add_aoa(ws, [[`GSTIN: ${company?.gst_number || 'N/A'}`]], { origin: 'A3' });
      XLSX.utils.sheet_add_aoa(ws, [[`Period: ${new Date(startDate).toLocaleDateString('en-IN')} to ${new Date(endDate).toLocaleDateString('en-IN')}`]], { origin: 'A4' });
      XLSX.utils.sheet_add_aoa(ws, [[`Generated on: ${new Date().toLocaleString('en-IN')}`]], { origin: 'A5' });
      
      // Add empty row
      XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A6' });

      // Add data starting from row 7
      XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A7' });

      // Set column widths
      ws['!cols'] = [
        { wch: 8 },  // Sr. No
        { wch: 15 }, // PO No
        { wch: 18 }, // Supplier Invoice No
        { wch: 12 }, // PO Date
        { wch: 25 }, // Supplier Name
        { wch: 18 }, // Supplier GSTIN
        { wch: 15 }, // Supplier Contact
        { wch: 30 }, // Supplier Address
        { wch: 30 }, // Item Description
        { wch: 12 }, // HSN/SAC
        { wch: 10 }, // Quantity
        { wch: 15 }, // Unit Price
        { wch: 18 }, // Taxable Value
        { wch: 15 }, // CGST
        { wch: 15 }, // SGST
        { wch: 15 }, // Total GST
        { wch: 15 }, // Line Total
        { wch: 18 }, // Grand Total
      ];

      // Merge cells for title
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 17 } }, // Title row
      ];

      // Add summary at the bottom
      const lastRow = 7 + exportData.length + 2;
      const totalPOs = posData.length;
      const totalAmount = posData.reduce((sum, po) => sum + po.grand_total, 0);
      const totalCGST = posData.reduce((sum, po) => sum + po.total_cgst, 0);
      const totalSGST = posData.reduce((sum, po) => sum + po.total_sgst, 0);

      XLSX.utils.sheet_add_aoa(ws, [['SUMMARY']], { origin: `A${lastRow}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total Purchase Orders: ${totalPOs}`]], { origin: `A${lastRow + 1}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total CGST: ₹${totalCGST.toFixed(2)}`]], { origin: `A${lastRow + 2}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total SGST: ₹${totalSGST.toFixed(2)}`]], { origin: `A${lastRow + 3}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total Amount: ₹${totalAmount.toFixed(2)}`]], { origin: `A${lastRow + 4}` });

      XLSX.utils.book_append_sheet(wb, ws, 'Purchase Orders Report');

      // Generate filename with date range
      const filename = `Purchase_Orders_Report_${startDate}_to_${endDate}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast.success(`Exported ${posData.length} purchase orders successfully`);
      setExportDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export purchase orders');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 px-4 md:px-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-9 w-48 bg-muted" />
          <Skeleton className="h-10 w-full sm:w-48 bg-muted" />
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
    <div className="space-y-6 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Purchase Orders</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export POs
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Purchase Orders</DialogTitle>
                <DialogDescription>
                  Select a date range to export purchase orders for GST filing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">From Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">To Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleExport} disabled={exportLoading} className="w-full">
                  {exportLoading ? 'Exporting...' : 'Export to Excel'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => navigate('/purchase-orders/create')} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {pos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No purchase orders created yet</p>
              <Button onClick={() => navigate('/purchase-orders/create')} className="w-full sm:w-auto">
                Create Your First Purchase Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">PO No</TableHead>
                      <TableHead className="min-w-[100px]">Invoice No</TableHead>
                      <TableHead className="min-w-[100px]">Date</TableHead>
                      <TableHead className="min-w-[150px]">Supplier Name</TableHead>
                      <TableHead className="text-right min-w-[120px]">Total Amount</TableHead>
                      <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pos.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.po_no}</TableCell>
                        <TableCell>{po.invoice_no || '-'}</TableCell>
                        <TableCell>{new Date(po.po_date).toLocaleDateString()}</TableCell>
                        <TableCell>{po.supplier_name}</TableCell>
                        <TableCell className="text-right">₹{po.grand_total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/purchase-orders/${po.id}`)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
