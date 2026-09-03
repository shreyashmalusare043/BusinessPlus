import { ChevronDown, Download, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBillsByDateRange, getBillsByPaymentDateRange, getMyBills, getMyCustomers, updateBillPaymentStatus } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { Bill, Customer } from '@/types';

export default function BillListPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportCompanies, setExportCompanies] = useState<string[]>([]);
  const [exportPaymentStatus, setExportPaymentStatus] = useState<'all' | 'paid' | 'pending' | 'unpaid'>('all');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'paid' | 'pending' | 'unpaid'>('all');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
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

    // Filter by selected companies
    if (selectedCompanies.length > 0) {
      filtered = filtered.filter(bill => selectedCompanies.includes(bill.customer_name));
    }

    if (filterPaymentStatus !== 'all') {
      filtered = filtered.filter(bill => bill.payment_status === filterPaymentStatus);
    }

    // Paid bills use payment_confirmed_at; other statuses use the bill date.
    if (filterFromDate) {
      filtered = filtered.filter(bill => {
        const filterDate = filterPaymentStatus === 'paid'
          ? bill.payment_confirmed_at?.slice(0, 10)
          : bill.bill_date;
        return Boolean(filterDate && filterDate >= filterFromDate);
      });
    }
    if (filterToDate) {
      filtered = filtered.filter(bill => {
        const filterDate = filterPaymentStatus === 'paid'
          ? bill.payment_confirmed_at?.slice(0, 10)
          : bill.bill_date;
        return Boolean(filterDate && filterDate <= filterToDate);
      });
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
  }, [bills, selectedCompanies, searchQuery, filterFromDate, filterToDate, filterPaymentStatus]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCompanies([]);
    setFilterFromDate('');
    setFilterToDate('');
    setFilterPaymentStatus('all');
  };

  const toggleCompany = (companyName: string) => {
    setSelectedCompanies(current =>
      current.includes(companyName)
        ? current.filter(company => company !== companyName)
        : [...current, companyName]
    );
  };

  const toggleExportCompany = (companyName: string) => {
    setExportCompanies(current =>
      current.includes(companyName)
        ? current.filter(company => company !== companyName)
        : [...current, companyName]
    );
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

  const handlePaymentDateChange = async (billId: string, paymentDate: string) => {
    if (!paymentDate) return;

    try {
      await updateBillPaymentStatus(billId, 'paid', paymentDate);
      await loadBills();
      toast.success('Payment date updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment date');
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
      const billsInDateRange = exportPaymentStatus === 'paid'
        ? await getBillsByPaymentDateRange(startDate, endDate)
        : await getBillsByDateRange(startDate, endDate);
      const billsData = billsInDateRange.filter((bill) => {
        const matchesCompany = exportCompanies.length === 0 || exportCompanies.includes(bill.customer_name);
        const matchesPaymentStatus = exportPaymentStatus === 'all' || bill.payment_status === exportPaymentStatus;
        return matchesCompany && matchesPaymentStatus;
      });

      if (billsData.length === 0) {
        toast.info('No bills found for the selected export filters');
        setExportLoading(false);
        return;
      }

      // Get company details for the report header
      const { getMyCompany } = await import('@/db/api');
      const company = await getMyCompany();

      // Keep item rows separate, but merge bill-level fields across the bill's item rows.
      const exportData: Record<string, string | number>[] = [];
      const billMergeRanges: { start: number; end: number; columns: number[] }[] = [];
      let serialNumber = 1;

      billsData.forEach((bill) => {
        const items = bill.bill_items.length > 0 ? bill.bill_items : [{
          item_name: '-', hsn_code: '', quantity: 0, unit: '', unit_price: 0,
          cgst_amount: 0, sgst_amount: 0, igst_amount: 0, line_total: 0,
        }];
        const startRow = exportData.length;
        items.forEach((item: any) => {
          const basicAmount = Number(item.quantity || 0) * Number(item.unit_price || 0);
          exportData.push({
            'Sr. No': serialNumber++,
            'Party Name': bill.customer_name,
            'GST No.': bill.customer_gst_number || '',
            'Invoice No.': bill.bill_no,
            Date: new Date(bill.bill_date).toLocaleDateString('en-IN'),
            'HSN Code': item.hsn_code || '',
            Qty: Number(item.quantity || 0),
            Unit: item.unit || '',
            'Rate (₹)': Number(item.unit_price || 0).toFixed(2),
            'Basic Amt (₹)': basicAmount.toFixed(2),
            'Freight / Other Chrg (₹)': '0.00',
            'Total Basic Amt (₹)': Number(bill.subtotal || 0).toFixed(2),
            'GST %': '18%',
            'IGST (₹)': Number(bill.total_igst || 0).toFixed(2),
            'CGST (₹)': Number(bill.total_cgst || 0).toFixed(2),
            'SGST (₹)': Number(bill.total_sgst || 0).toFixed(2),
            'Total (₹)': Number(bill.grand_total || 0).toFixed(2),
          });
        });

        if (items.length > 1) {
          billMergeRanges.push({
            start: startRow,
            end: exportData.length - 1,
            columns: [1, 2, 3, 4, 11, 12, 13, 14, 15, 16],
          });
        }
      });

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      // Add title
      XLSX.utils.sheet_add_aoa(ws, [['BILL DETAILS REPORT']], { origin: 'A1' });
      
      // Add company name and date range
      XLSX.utils.sheet_add_aoa(ws, [[`Company: ${company?.company_name || 'N/A'}`]], { origin: 'A2' });
      XLSX.utils.sheet_add_aoa(ws, [[`GSTIN: ${company?.gst_number || 'N/A'}`]], { origin: 'A3' });
      XLSX.utils.sheet_add_aoa(ws, [[`Period: ${new Date(startDate).toLocaleDateString('en-IN')} to ${new Date(endDate).toLocaleDateString('en-IN')}`]], { origin: 'A4' });
      XLSX.utils.sheet_add_aoa(ws, [[`Companies: ${exportCompanies.length > 0 ? exportCompanies.join(', ') : 'All Companies'}`]], { origin: 'A5' });
      XLSX.utils.sheet_add_aoa(ws, [[`Payment Status: ${exportPaymentStatus === 'all' ? 'All' : exportPaymentStatus.toUpperCase()}`]], { origin: 'A6' });
      XLSX.utils.sheet_add_aoa(ws, [[`Generated on: ${new Date().toLocaleString('en-IN')}`]], { origin: 'A7' });
      
      // Add empty row
      XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A8' });

      // Add data starting from row 9
      XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A9' });

      // Merge bill-level values vertically across all item rows for that bill.
      billMergeRanges.forEach(({ start, end, columns }) => {
        columns.forEach((column) => {
          ws['!merges'] = ws['!merges'] || [];
          ws['!merges'].push({
            s: { r: 9 + start, c: column },
            e: { r: 9 + end, c: column },
          });
        });
      });

      // Set column widths
      ws['!cols'] = [
        { wch: 8 }, { wch: 28 }, { wch: 18 }, { wch: 16 }, { wch: 13 },
        { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 13 }, { wch: 16 },
        { wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
        { wch: 14 }, { wch: 16 },
      ];

      // Merge cells for title
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 16 } }, // Title row
        ...(ws['!merges'] || []),
      ];
      ws['!autofilter'] = { ref: `A9:Q${9 + exportData.length}` };
      ws['!freeze'] = { xSplit: 0, ySplit: 9 };

      // Add summary at the bottom
      const lastRow = 9 + exportData.length + 2;
      const totalBills = billsData.length;
      const totalAmount = billsData.reduce((sum, bill) => sum + bill.grand_total, 0);
      const totalCGST = billsData.reduce((sum, bill) => sum + bill.total_cgst, 0);
      const totalSGST = billsData.reduce((sum, bill) => sum + bill.total_sgst, 0);
      const totalIGST = billsData.reduce((sum, bill) => sum + (bill.total_igst || 0), 0);

      XLSX.utils.sheet_add_aoa(ws, [['SUMMARY']], { origin: `A${lastRow}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total Bills: ${totalBills}`]], { origin: `A${lastRow + 1}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total CGST: ₹${totalCGST.toFixed(2)}`]], { origin: `A${lastRow + 2}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total SGST: ₹${totalSGST.toFixed(2)}`]], { origin: `A${lastRow + 3}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total IGST: ₹${totalIGST.toFixed(2)}`]], { origin: `A${lastRow + 4}` });
      XLSX.utils.sheet_add_aoa(ws, [[`Total Amount: ₹${totalAmount.toFixed(2)}`]], { origin: `A${lastRow + 5}` });

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
                <div className="space-y-2">
                  <Label>Filter by Company</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between text-sm font-normal">
                        <span className="truncate">
                          {exportCompanies.length === 0
                            ? 'All Companies'
                            : `${exportCompanies.length} compan${exportCompanies.length === 1 ? 'y' : 'ies'} selected`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56">
                      {customers.length === 0 ? (
                        <DropdownMenuCheckboxItem disabled>No companies available</DropdownMenuCheckboxItem>
                      ) : (
                        customers.map((customer) => (
                          <DropdownMenuCheckboxItem
                            key={customer.id}
                            checked={exportCompanies.includes(customer.company_name)}
                            onCheckedChange={() => toggleExportCompany(customer.company_name)}
                          >
                            {customer.company_name}
                          </DropdownMenuCheckboxItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="export-payment-status">Payment Status</Label>
                  <Select value={exportPaymentStatus} onValueChange={(value) => setExportPaymentStatus(value as typeof exportPaymentStatus)}>
                    <SelectTrigger id="export-payment-status" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bills</SelectItem>
                      <SelectItem value="paid">Paid Bills</SelectItem>
                      <SelectItem value="pending">Pending Bills</SelectItem>
                      <SelectItem value="unpaid">Unpaid Bills</SelectItem>
                    </SelectContent>
                  </Select>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
            <div className="flex-1">
              <Label htmlFor="company-filter" className="text-xs sm:text-sm mb-2 block">Filter by Company</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button id="company-filter" variant="outline" className="w-full justify-between text-sm font-normal">
                    <span className="truncate">
                      {selectedCompanies.length === 0
                        ? 'All Companies'
                        : `${selectedCompanies.length} compan${selectedCompanies.length === 1 ? 'y' : 'ies'} selected`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56">
                  {customers.length === 0 ? (
                    <DropdownMenuCheckboxItem disabled>No companies available</DropdownMenuCheckboxItem>
                  ) : (
                    customers.map((customer) => (
                      <DropdownMenuCheckboxItem
                        key={customer.id}
                        checked={selectedCompanies.includes(customer.company_name)}
                        onCheckedChange={() => toggleCompany(customer.company_name)}
                      >
                        {customer.company_name}
                      </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1">
              <Label htmlFor="filter-from-date" className="text-xs sm:text-sm mb-2 block">
                {filterPaymentStatus === 'paid' ? 'Paid From Date' : 'From Date'}
              </Label>
              <Input
                id="filter-from-date"
                type="date"
                value={filterFromDate}
                max={filterToDate || undefined}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="flex-1">
              <Label htmlFor="filter-to-date" className="text-xs sm:text-sm mb-2 block">
                {filterPaymentStatus === 'paid' ? 'Paid To Date' : 'To Date'}
              </Label>
              <Input
                id="filter-to-date"
                type="date"
                value={filterToDate}
                min={filterFromDate || undefined}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="flex-1">
              <Label htmlFor="filter-payment-status" className="text-xs sm:text-sm mb-2 block">Payment Status</Label>
              <Select value={filterPaymentStatus} onValueChange={(value) => setFilterPaymentStatus(value as typeof filterPaymentStatus)}>
                <SelectTrigger id="filter-payment-status" className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bills</SelectItem>
                  <SelectItem value="paid">Paid Bills</SelectItem>
                  <SelectItem value="pending">Pending Bills</SelectItem>
                  <SelectItem value="unpaid">Unpaid Bills</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedCompanies.length > 0 || filterFromDate || filterToDate || filterPaymentStatus !== 'all') && (
              <div className="flex items-end lg:col-span-4">
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
          {(searchQuery || selectedCompanies.length > 0 || filterFromDate || filterToDate || filterPaymentStatus !== 'all') && (
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
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Paid Date</TableHead>
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
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                        {bill.payment_status === 'paid' ? (
                          <Input
                            type="date"
                            value={bill.payment_confirmed_at?.slice(0, 10) || ''}
                            onChange={(event) => handlePaymentDateChange(bill.id, event.target.value)}
                            className="h-8 w-36 text-xs sm:text-sm"
                            aria-label={`Paid date for bill ${bill.bill_no}`}
                          />
                        ) : '-'}
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
