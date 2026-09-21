import { ChevronDown, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getBillsByDateRange, getMyCustomers, getMySuppliers, getPurchaseOrdersByDateRange, getReportData } from '@/db/api';
import type { Customer, ReportData, ReportType, Supplier } from '@/types';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [reportBills, setReportBills] = useState<Awaited<ReturnType<typeof getBillsByDateRange>>>([]);
  const [reportPurchaseOrders, setReportPurchaseOrders] = useState<Awaited<ReturnType<typeof getPurchaseOrdersByDateRange>>>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getMyCustomers(), getMySuppliers()])
      .then(([customerData, supplierData]) => {
        setCustomers(customerData);
        setSuppliers(supplierData);
      })
      .catch((error) => {
        console.error('Failed to load report companies:', error);
      });
  }, []);

  const getDateRange = (): { startDate: string; endDate: string } => {
    const today = new Date();
    let startDate: Date;
    let endDate = today;

    switch (reportType) {
      case 'daily':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        break;
      case 'weekly':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 90);
        break;
      case 'yearly':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) {
          throw new Error('Please select both start and end dates');
        }
        return { startDate: customStartDate, endDate: customEndDate };
      default:
        startDate = today;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const handleGenerateReport = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      setLoading(true);
      const [data, bills, purchaseOrders] = await Promise.all([
        getReportData(startDate, endDate, paymentStatus),
        getBillsByDateRange(startDate, endDate),
        getPurchaseOrdersByDateRange(startDate, endDate),
      ]);
      setReportData(data);
      setReportBills(bills);
      setReportPurchaseOrders(purchaseOrders);
      toast.success('Report generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const chartData = reportData.map((item) => ({
    month: new Date(`${item.period}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    Sales: item.total_sales,
    Purchases: item.total_purchases,
    Expenses: item.total_expenses,
    'Sales (excl. GST)': item.sales_without_gst,
    'Purchases (excl. GST)': item.purchases_without_gst,
    'Sales GST': item.sales_gst,
    'Purchases GST': item.purchases_gst,
  }));

  const totalSales = reportData.reduce((sum, item) => sum + item.total_sales, 0);
  const totalPurchases = reportData.reduce((sum, item) => sum + item.total_purchases, 0);
  const totalExpenses = reportData.reduce((sum, item) => sum + item.total_expenses, 0);
  const totalSalesGst = reportData.reduce((sum, item) => sum + item.sales_gst, 0);
  const totalPurchasesGst = reportData.reduce((sum, item) => sum + item.purchases_gst, 0);
  const totalSalesWithoutGst = reportData.reduce((sum, item) => sum + item.sales_without_gst, 0);
  const totalPurchasesWithoutGst = reportData.reduce((sum, item) => sum + item.purchases_without_gst, 0);
  const netProfit = totalSales - totalPurchases - totalExpenses;

  const filteredReportBills = useMemo(() => {
    return reportBills.filter((bill) => {
      const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(bill.customer_name);
      const matchesStatus = paymentStatus === 'all' || (paymentStatus === 'paid' ? bill.payment_status === 'paid' : bill.payment_status !== 'paid');
      return matchesCompany && matchesStatus;
    });
  }, [reportBills, selectedCompanies, paymentStatus]);

  const companySummaries = useMemo(() => {
    const summaries = new Map<string, { billCount: number; amount: number; gst: number; paid: number; pending: number }>();

    filteredReportBills.forEach((bill) => {
      const summary = summaries.get(bill.customer_name) || { billCount: 0, amount: 0, gst: 0, paid: 0, pending: 0 };
      summary.billCount += 1;
      summary.amount += Number(bill.grand_total || 0);
      summary.gst += Number(bill.total_cgst || 0) + Number(bill.total_sgst || 0) + Number(bill.total_igst || 0);
      if (bill.payment_status === 'paid') summary.paid += 1;
      else summary.pending += 1;
      summaries.set(bill.customer_name, summary);
    });

    return Array.from(summaries, ([company, summary]) => ({ company, ...summary }));
  }, [filteredReportBills]);

  const filteredReportPurchaseOrders = useMemo(() => {
    return reportPurchaseOrders.filter((purchaseOrder) => {
      const matchesSupplier = selectedSuppliers.length === 0 || selectedSuppliers.includes(purchaseOrder.supplier_name);
      const matchesStatus = paymentStatus === 'all' || (paymentStatus === 'paid' ? purchaseOrder.payment_status === 'paid' : purchaseOrder.payment_status !== 'paid');
      return matchesSupplier && matchesStatus;
    });
  }, [reportPurchaseOrders, selectedSuppliers, paymentStatus]);

  const supplierSummaries = useMemo(() => {
    const summaries = new Map<string, { orderCount: number; amount: number; gst: number; paid: number; unpaid: number }>();

    filteredReportPurchaseOrders.forEach((purchaseOrder) => {
      const summary = summaries.get(purchaseOrder.supplier_name) || { orderCount: 0, amount: 0, gst: 0, paid: 0, unpaid: 0 };
      summary.orderCount += 1;
      summary.amount += Number(purchaseOrder.grand_total || 0);
      summary.gst += Number(purchaseOrder.total_cgst || 0) + Number(purchaseOrder.total_sgst || 0) + Number(purchaseOrder.total_igst || 0);
      if (purchaseOrder.payment_status === 'paid') summary.paid += 1;
      else summary.unpaid += 1;
      summaries.set(purchaseOrder.supplier_name, summary);
    });

    return Array.from(summaries, ([supplier, summary]) => ({ supplier, ...summary }));
  }, [filteredReportPurchaseOrders]);

  const companyGrandTotal = useMemo(() => companySummaries.reduce((total, summary) => ({
    billCount: total.billCount + summary.billCount,
    amount: total.amount + summary.amount,
    gst: total.gst + summary.gst,
    paid: total.paid + summary.paid,
    pending: total.pending + summary.pending,
  }), { billCount: 0, amount: 0, gst: 0, paid: 0, pending: 0 }), [companySummaries]);

  const purchaseGrandTotal = useMemo(() => supplierSummaries.reduce((total, summary) => ({
    orderCount: total.orderCount + summary.orderCount,
    amount: total.amount + summary.amount,
    gst: total.gst + summary.gst,
    paid: total.paid + summary.paid,
    unpaid: total.unpaid + summary.unpaid,
  }), { orderCount: 0, amount: 0, gst: 0, paid: 0, unpaid: 0 }), [supplierSummaries]);

  const toggleCompany = (companyName: string) => {
    setSelectedCompanies((current) =>
      current.includes(companyName)
        ? current.filter((company) => company !== companyName)
        : [...current, companyName]
    );
  };

  const toggleSupplier = (supplierName: string) => {
    setSelectedSuppliers((current) =>
      current.includes(supplierName)
        ? current.filter((supplier) => supplier !== supplierName)
        : [...current, supplierName]
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (Last 30 Days)</SelectItem>
                  <SelectItem value="weekly">Weekly (Last 90 Days)</SelectItem>
                  <SelectItem value="yearly">Yearly (Last 12 Months)</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Filter by Company</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
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

            <div className="space-y-2">
              <Label>Filter Purchases by Supplier</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
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

            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as typeof paymentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bills & Purchases</SelectItem>
                  <SelectItem value="paid">Paid Only</SelectItem>
                  <SelectItem value="unpaid">Unpaid Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Company-wise Bill Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {companySummaries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bills found for the selected companies and date range.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="px-3 py-2 font-medium">Company</th>
                        <th className="px-3 py-2 text-right font-medium">Total Bills</th>
                        <th className="px-3 py-2 text-right font-medium">Total Amount</th>
                        <th className="px-3 py-2 text-right font-medium">GST (18%)</th>
                        <th className="px-3 py-2 text-right font-medium">Paid</th>
                        <th className="px-3 py-2 text-right font-medium">Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companySummaries.map((summary) => (
                        <tr key={summary.company} className="border-b last:border-0">
                          <td className="px-3 py-2 font-medium">{summary.company}</td>
                          <td className="px-3 py-2 text-right">{summary.billCount}</td>
                          <td className="px-3 py-2 text-right">₹{summary.amount.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">₹{summary.gst.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right text-green-600">{summary.paid}</td>
                          <td className="px-3 py-2 text-right text-orange-600">{summary.pending}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 bg-muted/30 font-bold">
                        <td className="px-3 py-2">GRAND TOTAL</td>
                        <td className="px-3 py-2 text-right">{companyGrandTotal.billCount}</td>
                        <td className="px-3 py-2 text-right">₹{companyGrandTotal.amount.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">₹{companyGrandTotal.gst.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-green-600">{companyGrandTotal.paid}</td>
                        <td className="px-3 py-2 text-right text-orange-600">{companyGrandTotal.pending}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company-wise Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {supplierSummaries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No purchase orders found for the selected suppliers and date range.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="px-3 py-2 font-medium">Company / Supplier</th>
                        <th className="px-3 py-2 text-right font-medium">Total POs</th>
                        <th className="px-3 py-2 text-right font-medium">Total Amount</th>
                        <th className="px-3 py-2 text-right font-medium">GST (18%)</th>
                        <th className="px-3 py-2 text-right font-medium">Paid</th>
                        <th className="px-3 py-2 text-right font-medium">Unpaid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierSummaries.map((summary) => (
                        <tr key={summary.supplier} className="border-b last:border-0">
                          <td className="px-3 py-2 font-medium">{summary.supplier}</td>
                          <td className="px-3 py-2 text-right">{summary.orderCount}</td>
                          <td className="px-3 py-2 text-right">₹{summary.amount.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">₹{summary.gst.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right text-green-600">{summary.paid}</td>
                          <td className="px-3 py-2 text-right text-orange-600">{summary.unpaid}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 bg-muted/30 font-bold">
                        <td className="px-3 py-2">GRAND TOTAL</td>
                        <td className="px-3 py-2 text-right">{purchaseGrandTotal.orderCount}</td>
                        <td className="px-3 py-2 text-right">₹{purchaseGrandTotal.amount.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">₹{purchaseGrandTotal.gst.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-green-600">{purchaseGrandTotal.paid}</td>
                        <td className="px-3 py-2 text-right text-orange-600">{purchaseGrandTotal.unpaid}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales (with GST)</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {reportData.length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases (with GST)</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">₹{totalPurchases.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {reportData.length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">₹{totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Business expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                {netProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{netProfit.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sales - Purchases - Expenses
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales GST</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">₹{totalSalesGst.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total GST collected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Purchases GST</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">₹{totalPurchasesGst.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total GST paid
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales (excl. GST)</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{totalSalesWithoutGst.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Base amount without GST
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Purchases (excl. GST)</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">₹{totalPurchasesWithoutGst.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Base amount without GST
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit (with GST)</CardTitle>
                {totalSales - totalPurchases >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalSales - totalPurchases >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{(totalSales - totalPurchases).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalSales > 0 ? `${((totalSales - totalPurchases) / totalSales * 100).toFixed(1)}% margin` : 'No sales yet'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net GST Liability</CardTitle>
                {totalSalesGst - totalPurchasesGst >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalSalesGst - totalPurchasesGst >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ₹{(totalSalesGst - totalPurchasesGst).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalSalesGst - totalPurchasesGst >= 0 ? 'GST payable to government' : 'GST refund eligible'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>GST Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Sales GST (18%)', value: totalSalesGst },
                        { name: 'Purchases GST (18%)', value: totalPurchasesGst },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f97316" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `₹${value.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Amount Breakdown (with vs without GST)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={[
                    { 
                      name: 'Sales', 
                      'With GST': totalSales, 
                      'Without GST': totalSalesWithoutGst,
                      'GST Amount': totalSalesGst
                    },
                    { 
                      name: 'Purchases', 
                      'With GST': totalPurchases, 
                      'Without GST': totalPurchasesWithoutGst,
                      'GST Amount': totalPurchasesGst
                    },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `₹${value.toFixed(2)}`}
                    />
                    <Legend />
                    <Bar dataKey="Without GST" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="GST Amount" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales & Purchase Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Sales" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Purchases" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Expenses" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      dot={{ fill: '#f97316', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales vs Purchases Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Sales', value: totalSales },
                        { name: 'Purchases', value: totalPurchases },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `₹${value.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comparison Bar Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Sales" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Purchases" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Month</th>
                      <th className="text-right py-2">Sales (with GST)</th>
                      <th className="text-right py-2">Sales GST</th>
                      <th className="text-right py-2">Sales (excl. GST)</th>
                      <th className="text-right py-2">Purchases (with GST)</th>
                      <th className="text-right py-2">Purchases GST</th>
                      <th className="text-right py-2">Purchases (excl. GST)</th>
                      <th className="text-right py-2">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-2">{new Date(`${item.period}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</td>
                        <td className="text-right py-2 text-green-600 font-medium">₹{item.total_sales.toFixed(2)}</td>
                        <td className="text-right py-2 text-blue-600">₹{item.sales_gst.toFixed(2)}</td>
                        <td className="text-right py-2 text-green-700">₹{item.sales_without_gst.toFixed(2)}</td>
                        <td className="text-right py-2 text-red-600 font-medium">₹{item.total_purchases.toFixed(2)}</td>
                        <td className="text-right py-2 text-orange-600">₹{item.purchases_gst.toFixed(2)}</td>
                        <td className="text-right py-2 text-red-700">₹{item.purchases_without_gst.toFixed(2)}</td>
                        <td className={`text-right py-2 font-bold ${item.total_sales - item.total_purchases >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{(item.total_sales - item.total_purchases).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 font-bold bg-muted/30">
                      <td className="py-3">TOTAL</td>
                      <td className="text-right py-3 text-green-600">₹{totalSales.toFixed(2)}</td>
                      <td className="text-right py-3 text-blue-600">₹{totalSalesGst.toFixed(2)}</td>
                      <td className="text-right py-3 text-green-700">₹{totalSalesWithoutGst.toFixed(2)}</td>
                      <td className="text-right py-3 text-red-600">₹{totalPurchases.toFixed(2)}</td>
                      <td className="text-right py-3 text-orange-600">₹{totalPurchasesGst.toFixed(2)}</td>
                      <td className="text-right py-3 text-red-700">₹{totalPurchasesWithoutGst.toFixed(2)}</td>
                      <td className={`text-right py-3 ${totalSales - totalPurchases >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{(totalSales - totalPurchases).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
