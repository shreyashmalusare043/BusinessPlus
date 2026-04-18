import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getMyPurchaseOrders, getPurchaseOrdersByDateRange, getMySuppliers } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Download, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { PurchaseOrder, Supplier } from '@/types';

export default function PurchaseOrderListPage() {
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
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

    // Filter by supplier
    if (selectedSupplier !== 'all') {
      filtered = filtered.filter(po => po.supplier_name === selectedSupplier);
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
  }, [pos, selectedSupplier, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSupplier('all');
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
            <div className="flex-1 sm:max-w-xs">
              <Label htmlFor="supplier-filter" className="text-xs sm:text-sm mb-2 block">Filter by Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger id="supplier-filter" className="text-sm">
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.company_name}>
                      {supplier.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedSupplier !== 'all') && (
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
          {(searchQuery || selectedSupplier !== 'all') && (
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
