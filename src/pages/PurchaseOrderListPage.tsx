import { ChevronDown, Download, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getMyPurchaseOrders, getMySuppliers, getPurchaseOrdersByDateRange, updatePurchaseOrderPaymentStatus } from '@/db/api';
import type { PurchaseOrder, Supplier } from '@/types';

export default function PurchaseOrderListPage() {
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPOs();
    loadSuppliers();
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

  const loadSuppliers = async () => {
    try {
      const data = await getMySuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  // Filter and search purchase orders
  const filteredPOs = useMemo(() => {
    let filtered = pos;

    // Filter by selected suppliers
    if (selectedSuppliers.length > 0) {
      filtered = filtered.filter(po => selectedSuppliers.includes(po.supplier_name));
    }

    // Filter by inclusive purchase order date range. po_date is stored as YYYY-MM-DD.
    if (filterFromDate) {
      filtered = filtered.filter(po => po.po_date >= filterFromDate);
    }
    if (filterToDate) {
      filtered = filtered.filter(po => po.po_date <= filterToDate);
    }

    // Search by PO number, invoice number, supplier name, or amount
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(po =>
        po.po_no.toLowerCase().includes(query) ||
        (po.invoice_no && po.invoice_no.toLowerCase().includes(query)) ||
        po.supplier_name.toLowerCase().includes(query) ||
        po.grand_total.toString().includes(query)
      );
    }

    return filtered;
  }, [pos, selectedSuppliers, searchQuery, filterFromDate, filterToDate]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSuppliers([]);
    setFilterFromDate('');
    setFilterToDate('');
  };

  const toggleSupplier = (supplierName: string) => {
    setSelectedSuppliers(current =>
      current.includes(supplierName)
        ? current.filter(supplier => supplier !== supplierName)
        : [...current, supplierName]
    );
  };

  const handlePaymentStatusChange = async (poId: string, paymentStatus: 'paid' | 'unpaid') => {
    try {
      await updatePurchaseOrderPaymentStatus(poId, paymentStatus);
      await loadPOs();
      toast.success('Payment status updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment status');
    }
  };

  const handlePaymentDateChange = async (poId: string, paymentDate: string) => {
    if (!paymentDate) return;

    try {
      await updatePurchaseOrderPaymentStatus(poId, 'paid', paymentDate);
      await loadPOs();
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
      const posData = await getPurchaseOrdersByDateRange(startDate, endDate);

      if (posData.length === 0) {
        toast.info('No purchase orders found in the selected date range');
        setExportLoading(false);
        return;
      }

      // Get company details for the report header
      const { getMyCompany } = await import('@/db/api');
      const company = await getMyCompany();

      // Keep item rows separate, but merge PO-level fields across the PO's item rows.
      const exportData: Record<string, string | number>[] = [];
      const poMergeRanges: { start: number; end: number; columns: number[] }[] = [];
      let serialNumber = 1;

      posData.forEach((po) => {
        const items = po.purchase_order_items.length > 0 ? po.purchase_order_items : [{
          item_name: '-', hsn_code: '', quantity: 0, unit_price: 0,
          cgst_amount: 0, sgst_amount: 0, igst_amount: 0, line_total: 0,
        }];
        const startRow = exportData.length;

        items.forEach((item: any) => {
          const basicAmount = Number(item.quantity || 0) * Number(item.unit_price || 0);
          exportData.push({
            'Sr. No': serialNumber++,
            'Party Name': po.supplier_name,
            'GST No.': po.supplier_gst_number || '',
            'Invoice No.': po.invoice_no || po.po_no,
            Date: new Date(po.po_date).toLocaleDateString('en-IN'),
            'HSN Code': item.hsn_code || '',
            Qty: Number(item.quantity || 0),
            Unit: item.unit || 'Nos',
            'Rate (₹)': Number(item.unit_price || 0).toFixed(2),
            'Basic Amt (₹)': basicAmount.toFixed(2),
            'Freight / Other Chrg (₹)': '0.00',
            'Total Basic Amt (₹)': Number(po.subtotal || 0).toFixed(2),
            'GST %': '18%',
            'IGST (₹)': '0.00',
            'CGST (₹)': Number(po.total_cgst || 0).toFixed(2),
            'SGST (₹)': Number(po.total_sgst || 0).toFixed(2),
            'Total (₹)': Number(po.grand_total || 0).toFixed(2),
          });
        });

        if (items.length > 1) {
          poMergeRanges.push({
            start: startRow,
            end: exportData.length - 1,
            columns: [1, 2, 3, 4, 10, 11, 12, 13, 14, 15, 16],
          });
        }
      });

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      // Add title
      XLSX.utils.sheet_add_aoa(ws, [['PURCHASE DETAILS REPORT']], { origin: 'A1' });
      
      // Add company name and date range
      XLSX.utils.sheet_add_aoa(ws, [[`Company: ${company?.company_name || 'N/A'}`]], { origin: 'A2' });
      XLSX.utils.sheet_add_aoa(ws, [[`GSTIN: ${company?.gst_number || 'N/A'}`]], { origin: 'A3' });
      XLSX.utils.sheet_add_aoa(ws, [[`Period: ${new Date(startDate).toLocaleDateString('en-IN')} to ${new Date(endDate).toLocaleDateString('en-IN')}`]], { origin: 'A4' });
      XLSX.utils.sheet_add_aoa(ws, [[`Generated on: ${new Date().toLocaleString('en-IN')}`]], { origin: 'A5' });
      
      // Add empty row
      XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A6' });

      // Add data starting from row 7
      XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A7' });

      poMergeRanges.forEach(({ start, end, columns }) => {
        columns.forEach((column) => {
          ws['!merges'] = ws['!merges'] || [];
          ws['!merges'].push({
            s: { r: 7 + start, c: column },
            e: { r: 7 + end, c: column },
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
      ws['!autofilter'] = { ref: `A7:Q${7 + exportData.length}` };
      ws['!freeze'] = { xSplit: 0, ySplit: 7 };

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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <Skeleton className="h-8 sm:h-9 w-40 sm:w-48 bg-muted" />
          <div className="flex gap-2 w-full sm:w-auto">
            <Skeleton className="h-9 sm:h-10 w-full sm:w-32 bg-muted" />
            <Skeleton className="h-9 sm:h-10 w-full sm:w-40 bg-muted" />
          </div>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Purchase Orders</h1>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full xs:w-auto">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Export POs</span>
                <span className="xs:hidden">Export</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Export Purchase Orders</DialogTitle>
                <DialogDescription className="text-sm">
                  Select a date range to export purchase orders for GST filing
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
          <Button onClick={() => navigate('/purchase-orders/create')} className="w-full xs:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Create Purchase Order</span>
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
              <Label htmlFor="search" className="text-xs sm:text-sm mb-2 block">Search Purchase Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by PO no, invoice no, supplier, or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            {/* Supplier Filter */}
            <div className="flex-1">
              <Label htmlFor="supplier-filter" className="text-xs sm:text-sm mb-2 block">Filter by Supplier</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button id="supplier-filter" variant="outline" className="w-full justify-between text-sm font-normal">
                    <span className="truncate">
                      {selectedSuppliers.length === 0
                        ? 'All Suppliers'
                        : `${selectedSuppliers.length} supplier${selectedSuppliers.length === 1 ? '' : 's'} selected`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56">
                  {suppliers.length === 0 ? (
                    <DropdownMenuCheckboxItem disabled>No suppliers available</DropdownMenuCheckboxItem>
                  ) : (
                    suppliers.map((supplier) => (
                      <DropdownMenuCheckboxItem
                        key={supplier.id}
                        checked={selectedSuppliers.includes(supplier.company_name)}
                        onCheckedChange={() => toggleSupplier(supplier.company_name)}
                      >
                        {supplier.company_name}
                      </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1">
              <Label htmlFor="filter-from-date" className="text-xs sm:text-sm mb-2 block">From Date</Label>
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
              <Label htmlFor="filter-to-date" className="text-xs sm:text-sm mb-2 block">To Date</Label>
              <Input
                id="filter-to-date"
                type="date"
                value={filterToDate}
                min={filterFromDate || undefined}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedSuppliers.length > 0 || filterFromDate || filterToDate) && (
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
          {(searchQuery || selectedSuppliers.length > 0 || filterFromDate || filterToDate) && (
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {filteredPOs.length} of {pos.length} purchase orders
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-lg sm:text-xl">All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {filteredPOs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {pos.length === 0 ? 'No purchase orders created yet' : 'No purchase orders match your search criteria'}
              </p>
              {pos.length === 0 ? (
                <Button onClick={() => navigate('/purchase-orders/create')} className="w-full sm:w-auto">
                  Create Your First Purchase Order
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
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">PO No</TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Invoice No</TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Supplier Name</TableHead>
                    <TableHead className="text-right whitespace-nowrap text-xs sm:text-sm">Total Amount</TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Payment Status</TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">Paid Date</TableHead>
                    <TableHead className="text-right whitespace-nowrap text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium whitespace-nowrap text-xs sm:text-sm">{po.po_no}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">{po.invoice_no || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">{new Date(po.po_date).toLocaleDateString()}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">{po.supplier_name}</TableCell>
                      <TableCell className="text-right whitespace-nowrap text-xs sm:text-sm">₹{po.grand_total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={po.payment_status || 'unpaid'}
                          onValueChange={(value) => handlePaymentStatusChange(po.id, value as 'paid' | 'unpaid')}
                        >
                          <SelectTrigger className="w-24 sm:w-28 h-8 sm:h-10 text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                        {po.payment_status === 'paid' ? (
                          <Input
                            type="date"
                            value={po.payment_confirmed_at?.slice(0, 10) || ''}
                            onChange={(event) => handlePaymentDateChange(po.id, event.target.value)}
                            className="h-8 w-36 text-xs sm:text-sm"
                            aria-label={`Paid date for purchase order ${po.po_no}`}
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/purchase-orders/${po.id}`)}
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
