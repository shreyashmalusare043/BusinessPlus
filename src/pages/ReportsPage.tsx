import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getReportData } from '@/db/api';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import type { ReportData, ReportType } from '@/types';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);

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
      const data = await getReportData(startDate, endDate);
      setReportData(data);
      toast.success('Report generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const chartData = reportData.map((item) => ({
    date: new Date(item.period).toLocaleDateString(),
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
                        { name: 'Sales GST', value: totalSalesGst },
                        { name: 'Purchases GST', value: totalPurchasesGst },
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
                      dataKey="date" 
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
                    dataKey="date" 
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
                      <th className="text-left py-2">Date</th>
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
                        <td className="py-2">{new Date(item.period).toLocaleDateString()}</td>
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
