import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getMyBills, updateBillPaymentStatus, getBillsByDateRange } from '@/db/api';
import { supabase } from '@/db/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { Bill } from '@/types';

export default function BillListPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const data = await getMyBills();
      setBills(data);
    } catch (error) {
      console.error('Failed to load bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = async (billId: string, status: 'pending' | 'paid' | 'unpaid') => {
    try {
      await updateBillPaymentStatus(billId, status);
      
      // If status changed to 'paid', send confirmation email
      if (status === 'paid') {
        const bill = bills.find(b => b.id === billId);
        if (bill?.customer_email) {
          try {
            await supabase.functions.invoke('send-payment-email', {
              body: {
                type: 'confirmation',
                billId: bill.id,
                customerEmail: bill.customer_email,
                customerName: bill.customer_name,
                billNo: bill.bill_no,
                amount: bill.grand_total,
              },
            });
            toast.success('Payment status updated and confirmation email sent');
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            toast.success('Payment status updated (email notification failed)');
          }
        } else {
          toast.success('Payment status updated');
        }
      } else {
        toast.success('Payment status updated');
      }
      
      loadBills();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment status');
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
      const billsData = await getBillsByDateRange(startDate, endDate);

      if (billsData.length === 0) {
        toast.info('No bills found in the selected date range');
        setExportLoading(false);
        return;
      }

      // Get company details for the report header
      const { getMyCompany } = await import('@/db/api');
      const company = await getMyCompany();

      // Prepare data for Excel export
      const exportData = billsData.flatMap(bill =>
        bill.bill_items.map((item: any, index: number) => ({
          'Sr. No': index + 1,
          'Bill No': bill.bill_no,
          'Bill Date': new Date(bill.bill_date).toLocaleDateString('en-IN'),
          'Customer Name': bill.customer_name,
          'Item Description': item.item_name,
          'HSN/SAC Code': item.hsn_code,
          'Quantity': item.quantity,
          'Unit Price (₹)': item.unit_price.toFixed(2),
          'Taxable Value (₹)': (item.quantity * item.unit_price).toFixed(2),
          'CGST @ 9% (₹)': item.cgst_amount.toFixed(2),
          'SGST @ 9% (₹)': item.sgst_amount.toFixed(2),
          'Total GST (₹)': (item.cgst_amount + item.sgst_amount).toFixed(2),
          'Line Total (₹)': item.line_total.toFixed(2),
          'Bill Grand Total (₹)': bill.grand_total.toFixed(2),
          'Payment Status': bill.payment_status.toUpperCase(),
        }))
      );

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      // Add title
      XLSX.utils.sheet_add_aoa(ws, [['MONTHLY BILLS REPORT']], { origin: 'A1' });
      
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
        { wch: 15 }, // Bill No
        { wch: 12 }, // Bill Date
        { wch: 25 }, // Customer Name
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
        { wch: 15 }, // Payment Status
      ];

      // Merge cells for title
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // Title row
      ];

      // Add summary at the bottom
      const lastRow = 7 + exportData.length + 2;
      const totalBills = billsData.length;
      const totalAmount = billsData.reduce((sum, bill) => sum + bill.grand_total, 0);
      const totalCGST = billsData.reduce((sum, bill) => sum + bill.total_cgst, 0);
      const totalSGST = billsData.reduce((sum, bill) => sum + bill.total_sgst, 0);

      XLSX.utils.sheet_add_aoa(ws, [['SUMMARY']], { origin: `A${lastRow}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total Bills: ${totalBills}`]], { origin: `A${lastRow + 1}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total CGST: ₹${totalCGST.toFixed(2)}`]], { origin: `A${lastRow + 2}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total SGST: ₹${totalSGST.toFixed(2)}`]], { origin: `A${lastRow + 3}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total Amount: ₹${totalAmount.toFixed(2)}`]], { origin: `A${lastRow + 4}` });

      XLSX.utils.book_append_sheet(wb, ws, 'Bills Report');

      // Generate filename with date range
      const filename = `Bills_Report_${startDate}_to_${endDate}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast.success(`Exported ${billsData.length} bills successfully`);
      setExportDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export bills');
    } finally {
      setExportLoading(false);
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
        <h1 className="text-3xl font-bold">Bills</h1>
        <div className="flex gap-2">
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Bills
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Bills</DialogTitle>
                <DialogDescription>
                  Select a date range to export bills for GST filing
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
          <Button onClick={() => navigate('/bills/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Bill
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No bills created yet</p>
              <Button onClick={() => navigate('/bills/create')}>Create Your First Bill</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">GST Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment Reminder</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.bill_no}</TableCell>
                    <TableCell>{new Date(bill.bill_date).toLocaleDateString()}</TableCell>
                    <TableCell>{bill.customer_name}</TableCell>
                    <TableCell className="text-right">₹{bill.grand_total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{(bill.total_cgst + bill.total_sgst).toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={bill.payment_status}
                        onValueChange={(value) => handlePaymentStatusChange(bill.id, value as 'pending' | 'paid' | 'unpaid')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              Pending
                            </Badge>
                          </SelectItem>
                          <SelectItem value="paid">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Paid
                            </Badge>
                          </SelectItem>
                          <SelectItem value="unpaid">
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                              Unpaid
                            </Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {bill.payment_reminder === 'none' ? 'None' : 
                         bill.payment_reminder === '7_days' ? '7 Days' :
                         bill.payment_reminder === '30_days' ? '30 Days' :
                         bill.payment_reminder === '45_days' ? '45 Days' :
                         bill.payment_reminder === '90_days' ? '90 Days' : 'None'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/bills/${bill.id}`)}>
                        View
                      </Button>
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
