import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getMyBills, updateBillPaymentStatus, getBillsByDateRange, getMyCustomers } from '@/db/api';
import { supabase } from '@/db/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Download, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { Bill, Customer } from '@/types';

export default function BillListPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadBills();
    loadCustomers();
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

  const loadCustomers = async () => {
    try {
      const data = await getMyCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  // Filter and search bills
  const filteredBills = useMemo(() => {
    let filtered = bills;

    // Filter by company
    if (selectedCompany !== 'all') {
      filtered = filtered.filter(bill => bill.customer_name === selectedCompany);
    }

    // Search by bill number, customer name, or amount
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bill =>
        bill.bill_no.toLowerCase().includes(query) ||
        bill.customer_name.toLowerCase().includes(query) ||
        bill.grand_total.toString().includes(query)
      );
    }

    return filtered;
  }, [bills, selectedCompany, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCompany('all');
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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <Skeleton className="h-8 sm:h-9 w-32 sm:w-40 bg-muted" />
          <div className="flex gap-2 w-full sm:w-auto">
            <Skeleton className="h-9 sm:h-10 w-full sm:w-32 bg-muted" />
            <Skeleton className="h-9 sm:h-10 w-full sm:w-32 bg-muted" />
          </div>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Bills</h1>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full xs:w-auto">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Export Bills</span>
                <span className="xs:hidden">Export</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Export Bills</DialogTitle>
                <DialogDescription className="text-sm">
                  Select a date range to export bills for GST filing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm">From Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm">To Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button onClick={handleExport} disabled={exportLoading} className="w-full">
                  {exportLoading ? 'Exporting...' : 'Export to Excel'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => navigate('/bills/create')} className="w-full xs:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Create Bill</span>
            <span className="xs:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-xs sm:text-sm mb-2 block">Search Bills</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by bill no, customer, or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            {/* Company Filter */}
            <div className="flex-1 sm:max-w-xs">
              <Label htmlFor="company-filter" className="text-xs sm:text-sm mb-2 block">Filter by Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger id="company-filter" className="text-sm">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.company_name}>
                      {customer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedCompany !== 'all') && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                >
                  <X className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Results Count */}
          {(searchQuery || selectedCompany !== 'all') && (
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {filteredBills.length} of {bills.length} bills
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">All Bills</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {filteredBills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {bills.length === 0 ? 'No bills created yet' : 'No bills match your search criteria'}
              </p>
              {bills.length === 0 ? (
                <Button onClick={() => navigate('/bills/create')} className="w-full sm:w-auto">
                  Create Your First Bill
                </Button>
              ) : (
                <Button onClick={handleClearFilters} variant="outline" className="w-full sm:w-auto">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Bill No</TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Customer Name</TableHead>
                    <TableHead className="text-right whitespace-nowrap text-xs sm:text-sm">Total Amount</TableHead>
                    <TableHead className="text-right whitespace-nowrap text-xs sm:text-sm">GST Amount</TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Payment Status</TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Payment Reminder</TableHead>
                    <TableHead className="text-right whitespace-nowrap text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium whitespace-nowrap text-xs sm:text-sm">{bill.bill_no}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">{new Date(bill.bill_date).toLocaleDateString()}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">{bill.customer_name}</TableCell>
                      <TableCell className="text-right whitespace-nowrap text-xs sm:text-sm">₹{bill.grand_total.toFixed(2)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap text-xs sm:text-sm">₹{(bill.total_cgst + bill.total_sgst).toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={bill.payment_status}
                          onValueChange={(value) => handlePaymentStatusChange(bill.id, value as 'pending' | 'paid' | 'unpaid')}
                        >
                          <SelectTrigger className="w-28 sm:w-32 h-8 sm:h-10 text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                Pending
                              </Badge>
                            </SelectItem>
                            <SelectItem value="paid">
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                                Paid
                              </Badge>
                            </SelectItem>
                            <SelectItem value="unpaid">
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs">
                                Unpaid
                              </Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          {bill.payment_reminder === 'none' ? 'None' : 
                           bill.payment_reminder === '7_days' ? '7 Days' :
                           bill.payment_reminder === '30_days' ? '30 Days' :
                           bill.payment_reminder === '45_days' ? '45 Days' :
                           bill.payment_reminder === '90_days' ? '90 Days' : 'None'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/bills/${bill.id}`)}
                          className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
