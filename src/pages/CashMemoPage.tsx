import { format } from 'date-fns';
import { Download, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { createCashMemo, deleteCashMemo, getMyCashMemos, updateCashMemo } from '@/db/api';
import type { CashInPurpose, CashMemo, CashMemoForm, CashMemoType, CashOutPurpose } from '@/types';

const CASH_IN_PURPOSES: CashInPurpose[] = ['Payment', 'Scrap', 'Advance', 'Other'];
const CASH_OUT_PURPOSES: CashOutPurpose[] = ['Expense', 'Investment', 'Advance', 'Other'];
const today = format(new Date(), 'yyyy-MM-dd');

export default function CashMemoPage() {
  const [memos, setMemos] = useState<CashMemo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState<CashMemo | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [exportType, setExportType] = useState<'all' | CashMemoType>('all');
  const [activeType, setActiveType] = useState<CashMemoType>('cash_in');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | CashMemoType>('all');
  const [filterPerson, setFilterPerson] = useState('all');
  const [filterPurpose, setFilterPurpose] = useState('all');

  const form = useForm<CashMemoForm>({
    defaultValues: {
      transaction_type: 'cash_in',
      transaction_date: today,
      person_company_name: '',
      purpose: 'Payment',
      amount: 0,
      remark: '',
    },
  });

  const loadMemos = async () => {
    try {
      setLoading(true);
      setMemos(await getMyCashMemos());
    } catch (error: any) {
      toast.error(error.message || 'Failed to load cash memos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMemos(); }, []);

  const filteredMemos = useMemo(() => memos.filter((memo) => {
    const inDateRange = (!fromDate || memo.transaction_date >= fromDate) && (!toDate || memo.transaction_date <= toDate);
    const matchesType = filterType === 'all' || memo.transaction_type === filterType;
    const matchesPerson = filterPerson === 'all' || memo.person_company_name === filterPerson;
    const matchesPurpose = filterPurpose === 'all' || memo.purpose === filterPurpose;
    return inDateRange && matchesType && matchesPerson && matchesPurpose;
  }), [memos, fromDate, toDate, filterType, filterPerson, filterPurpose]);

  const openingBalance = useMemo(() => memos
    .filter((memo) => fromDate && memo.transaction_date < fromDate)
    .reduce((balance, memo) => balance + (memo.transaction_type === 'cash_in' ? Number(memo.amount) : -Number(memo.amount)), 0), [memos, fromDate]);
  const totalCashIn = filteredMemos.filter((memo) => memo.transaction_type === 'cash_in').reduce((sum, memo) => sum + Number(memo.amount), 0);
  const totalCashOut = filteredMemos.filter((memo) => memo.transaction_type === 'cash_out').reduce((sum, memo) => sum + Number(memo.amount), 0);
  const closingBalance = openingBalance + totalCashIn - totalCashOut;
  const people = Array.from(new Set(memos.map((memo) => memo.person_company_name))).sort();
  const purposes = Array.from(new Set(memos.map((memo) => memo.purpose))).sort();

  const openNewMemo = (type: CashMemoType) => {
    setEditingMemo(null);
    setActiveType(type);
    form.reset({ transaction_type: type, transaction_date: today, person_company_name: '', purpose: type === 'cash_in' ? 'Payment' : 'Expense', amount: 0, remark: '' });
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CashMemoForm) => {
    try {
      setSaving(true);
      if (editingMemo) await updateCashMemo(editingMemo.id, data);
      else await createCashMemo(data);
      toast.success(editingMemo ? 'Cash memo updated' : 'Cash memo added');
      setDialogOpen(false);
      setEditingMemo(null);
      await loadMemos();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save cash memo');
    } finally {
      setSaving(false);
    }
  };

  const editMemo = (memo: CashMemo) => {
    setEditingMemo(memo);
    setActiveType(memo.transaction_type);
    form.reset({ transaction_type: memo.transaction_type, transaction_date: memo.transaction_date, person_company_name: memo.person_company_name, purpose: memo.purpose, amount: Number(memo.amount), remark: memo.remark || '' });
    setDialogOpen(true);
  };

  const removeMemo = async (memo: CashMemo) => {
    if (!confirm('Delete this cash memo?')) return;
    try {
      await deleteCashMemo(memo.id);
      toast.success('Cash memo deleted');
      await loadMemos();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete cash memo');
    }
  };

  const exportExcel = () => {
    if (exportFromDate && exportToDate && exportFromDate > exportToDate) {
      toast.error('From Date must be before To Date');
      return;
    }

    const exportMemos = memos.filter((memo) => {
      const matchesDate = (!exportFromDate || memo.transaction_date >= exportFromDate) && (!exportToDate || memo.transaction_date <= exportToDate);
      const matchesType = exportType === 'all' || memo.transaction_type === exportType;
      return matchesDate && matchesType;
    });
    const exportCashIn = exportMemos.filter((memo) => memo.transaction_type === 'cash_in').reduce((sum, memo) => sum + Number(memo.amount), 0);
    const exportCashOut = exportMemos.filter((memo) => memo.transaction_type === 'cash_out').reduce((sum, memo) => sum + Number(memo.amount), 0);
    const exportOpening = exportFromDate
      ? memos.filter((memo) => memo.transaction_date < exportFromDate).reduce((balance, memo) => balance + (memo.transaction_type === 'cash_in' ? Number(memo.amount) : -Number(memo.amount)), 0)
      : 0;
    const rows = exportMemos.map((memo, index) => ({
      'Sr. No.': index + 1,
      Type: memo.transaction_type === 'cash_in' ? 'Cash In' : 'Cash Out',
      Date: memo.transaction_date,
      'Person / Company': memo.person_company_name,
      Purpose: memo.purpose,
      'Cash In (₹)': memo.transaction_type === 'cash_in' ? Number(memo.amount) : 0,
      'Cash Out (₹)': memo.transaction_type === 'cash_out' ? Number(memo.amount) : 0,
      Remark: memo.remark || '',
    }));
    rows.push({ 'Sr. No.': '', Type: 'SUMMARY', Date: '', 'Person / Company': '', Purpose: '', 'Cash In (₹)': exportCashIn, 'Cash Out (₹)': exportCashOut, Remark: `Opening: ₹${exportOpening.toFixed(2)} | Closing: ₹${(exportOpening + exportCashIn - exportCashOut).toFixed(2)}` });
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 35 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Cash Memo');
    XLSX.writeFile(workbook, `Cash_Memo_${exportFromDate || 'all'}_to_${exportToDate || 'all'}_${exportType}.xlsx`);
    setExportDialogOpen(false);
  };

  return (
    <div className="space-y-6 print:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-bold">Cash Memo</h1><p className="text-muted-foreground">Track cash received and cash spent</p></div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" onClick={() => openNewMemo('cash_in')}><Plus className="mr-2 h-4 w-4" />Cash In</Button>
          <Button onClick={() => openNewMemo('cash_out')}><Plus className="mr-2 h-4 w-4" />Cash Out</Button>
        </div>
      </div>

      <Tabs defaultValue="cash-in">
        <TabsList className="print:hidden"><TabsTrigger value="cash-in">Cash In</TabsTrigger><TabsTrigger value="cash-out">Cash Out</TabsTrigger><TabsTrigger value="report">Cash Report</TabsTrigger></TabsList>
        <TabsContent value="cash-in"><MemoTable title="Cash In" rows={filteredMemos.filter((memo) => memo.transaction_type === 'cash_in')} onEdit={editMemo} onDelete={removeMemo} loading={loading} empty="No cash received entries" /></TabsContent>
        <TabsContent value="cash-out"><MemoTable title="Cash Out" rows={filteredMemos.filter((memo) => memo.transaction_type === 'cash_out')} onEdit={editMemo} onDelete={removeMemo} loading={loading} empty="No cash spent entries" /></TabsContent>
        <TabsContent value="report" className="space-y-6">
          <Card className="print:hidden"><CardHeader><CardTitle>Cash Report Filters</CardTitle></CardHeader><CardContent><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div><Label>From Date</Label><Input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} /></div>
            <div><Label>To Date</Label><Input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} /></div>
            <div><Label>Type</Label><Select value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="cash_in">Cash In</SelectItem><SelectItem value="cash_out">Cash Out</SelectItem></SelectContent></Select></div>
            <div><Label>Person / Company</Label><Select value={filterPerson} onValueChange={setFilterPerson}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{people.map((person) => <SelectItem key={person} value={person}>{person}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Purpose</Label><Select value={filterPurpose} onValueChange={setFilterPurpose}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{purposes.map((purpose) => <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>)}</SelectContent></Select></div>
          </div></CardContent></Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><BalanceCard label="Opening Balance" value={openingBalance} /><BalanceCard label="Total Cash In" value={totalCashIn} positive /><BalanceCard label="Total Cash Out" value={totalCashOut} negative /><BalanceCard label="Closing Balance" value={closingBalance} /></div>
          <div className="flex flex-wrap gap-2 print:hidden"><Button variant="outline" onClick={() => { setExportFromDate(fromDate); setExportToDate(toDate); setExportDialogOpen(true); }}><Download className="mr-2 h-4 w-4" />Export Excel</Button></div>
          <Card><CardHeader><CardTitle>Person / Company-wise Details</CardTitle></CardHeader><CardContent><SummaryTable rows={filteredMemos} groupKey="person_company_name" /></CardContent></Card>
          <Card><CardHeader><CardTitle>Category-wise Details</CardTitle></CardHeader><CardContent><SummaryTable rows={filteredMemos} groupKey="purpose" /></CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Cash Report</DialogTitle>
            <DialogDescription>Select cash type and date range for the Excel file.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cash Type</Label>
              <Select value={exportType} onValueChange={(value) => setExportType(value as typeof exportType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cash</SelectItem>
                  <SelectItem value="cash_in">Cash In</SelectItem>
                  <SelectItem value="cash_out">Cash Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>From Date</Label><Input type="date" value={exportFromDate} max={exportToDate || undefined} onChange={(event) => setExportFromDate(event.target.value)} /></div>
              <div className="space-y-2"><Label>To Date</Label><Input type="date" value={exportToDate} min={exportFromDate || undefined} onChange={(event) => setExportToDate(event.target.value)} /></div>
            </div>
            <Button onClick={exportExcel} className="w-full"><Download className="mr-2 h-4 w-4" />Export Excel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editingMemo ? 'Edit Cash Memo' : activeType === 'cash_in' ? 'Add Cash In' : 'Add Cash Out'}</DialogTitle><DialogDescription>Record the cash transaction details.</DialogDescription></DialogHeader><Form {...form}><form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="transaction_date" rules={{ required: 'Date is required' }} render={({ field }) => <FormItem><FormLabel>Date</FormLabel><FormControl><Input {...field} type="date" disabled={saving} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="person_company_name" rules={{ required: 'Person or company is required' }} render={({ field }) => <FormItem><FormLabel>Person / Company Name</FormLabel><FormControl><Input {...field} placeholder="e.g. ABC Company or Scrap Dealer" disabled={saving} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="purpose" rules={{ required: 'Purpose is required' }} render={({ field }) => <FormItem><FormLabel>Purpose</FormLabel><Select value={field.value} onValueChange={field.onChange} disabled={saving}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{(form.watch('transaction_type') === 'cash_in' ? CASH_IN_PURPOSES : CASH_OUT_PURPOSES).map((purpose) => <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} />
        <FormField control={form.control} name="amount" rules={{ required: 'Amount is required', min: { value: 0.01, message: 'Amount must be greater than zero' } }} render={({ field }) => <FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input {...field} type="number" step="0.01" onChange={(event) => field.onChange(Number(event.target.value) || 0)} disabled={saving} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="remark" render={({ field }) => <FormItem><FormLabel>Remark</FormLabel><FormControl><Textarea {...field} placeholder="Optional details" rows={3} disabled={saving} /></FormControl><FormMessage /></FormItem>} />
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button></div>
      </form></Form></DialogContent></Dialog>
    </div>
  );
}

function MemoTable({ title, rows, onEdit, onDelete, loading, empty }: { title: string; rows: CashMemo[]; onEdit: (memo: CashMemo) => void; onDelete: (memo: CashMemo) => void; loading: boolean; empty: string }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{loading ? <div className="py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div> : rows.length === 0 ? <p className="py-8 text-center text-muted-foreground">{empty}</p> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Person / Company</TableHead><TableHead>Purpose</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Remark</TableHead><TableHead className="text-right print:hidden">Actions</TableHead></TableRow></TableHeader><TableBody>{rows.map((memo) => <TableRow key={memo.id}><TableCell>{memo.transaction_date}</TableCell><TableCell className="font-medium">{memo.person_company_name}</TableCell><TableCell>{memo.purpose}</TableCell><TableCell className="text-right">₹{Number(memo.amount).toFixed(2)}</TableCell><TableCell>{memo.remark || '-'}</TableCell><TableCell className="text-right print:hidden"><Button variant="ghost" size="icon" onClick={() => onEdit(memo)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => onDelete(memo)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>)}</TableBody></Table></div>}</CardContent></Card>;
}

function BalanceCard({ label, value, positive, negative }: { label: string; value: number; positive?: boolean; negative?: boolean }) {
  return <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{label}</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${positive ? 'text-green-600' : negative ? 'text-red-600' : ''}`}>₹{value.toFixed(2)}</div></CardContent></Card>;
}

function SummaryTable({ rows, groupKey }: { rows: CashMemo[]; groupKey: 'person_company_name' | 'purpose' }) {
  const summary = new Map<string, { cashIn: number; cashOut: number; count: number }>();
  rows.forEach((row) => { const key = row[groupKey]; const current = summary.get(key) || { cashIn: 0, cashOut: 0, count: 0 }; current.count += 1; if (row.transaction_type === 'cash_in') current.cashIn += Number(row.amount); else current.cashOut += Number(row.amount); summary.set(key, current); });
  return <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>{groupKey === 'purpose' ? 'Category' : 'Person / Company'}</TableHead><TableHead className="text-right">Entries</TableHead><TableHead className="text-right">Cash In</TableHead><TableHead className="text-right">Cash Out</TableHead><TableHead className="text-right">Net</TableHead></TableRow></TableHeader><TableBody>{Array.from(summary, ([name, values]) => <TableRow key={name}><TableCell className="font-medium">{name}</TableCell><TableCell className="text-right">{values.count}</TableCell><TableCell className="text-right text-green-600">₹{values.cashIn.toFixed(2)}</TableCell><TableCell className="text-right text-red-600">₹{values.cashOut.toFixed(2)}</TableCell><TableCell className="text-right">₹{(values.cashIn - values.cashOut).toFixed(2)}</TableCell></TableRow>)}</TableBody></Table></div>;
}
