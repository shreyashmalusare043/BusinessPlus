import { supabase } from './supabase';
import type {
  Profile,
  Company,
  Bill,
  BillWithItems,
  BillItem,
  PurchaseOrder,
  PurchaseOrderWithItems,
  PurchaseOrderItem,
  StockItem,
  Customer,
  Supplier,
  SupportTicket,
  DeliveryChallan,
  DeliveryChallanWithItems,
  DeliveryChallanItem,
  DeliveryChallanForm,
  Subscription,
  SubscriptionWithUser,
  Transaction,
  TransactionWithUser,
  TransactionStatus,
  DashboardStats,
  ReportData,
  CompanyForm,
  BillForm,
  PurchaseOrderForm,
  StockItemForm,
} from '@/types';

// ============ Profile APIs ============
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

// ============ Company APIs ============
export async function getMyCompany(): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createOrUpdateCompany(companyData: CompanyForm): Promise<Company> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const existing = await getMyCompany();

  if (existing) {
    const { data, error } = await supabase
      .from('companies')
      .update({ ...companyData, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('companies')
      .insert({ ...companyData, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ============ Bill APIs ============
export async function getMyBills(limit = 100, offset = 0): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .order('bill_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getRecentBills(limit = 5): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getBillById(billId: string): Promise<BillWithItems | null> {
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .select('*')
    .eq('id', billId)
    .maybeSingle();

  if (billError) throw billError;
  if (!bill) return null;

  const { data: items, error: itemsError } = await supabase
    .from('bill_items')
    .select('*')
    .eq('bill_id', billId)
    .order('created_at', { ascending: true });

  if (itemsError) throw itemsError;

  return {
    ...bill,
    bill_items: Array.isArray(items) ? items : [],
  };
}

export async function getNextBillNo(): Promise<string> {
  console.log('🔵 getNextBillNo() called - Starting bill number generation');
  
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');
  
  console.log('🔵 User ID:', userId);

  // Get company details for prefix
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('user_id', userId)
    .maybeSingle();

  console.log('🔵 Company data:', company);

  // Generate company prefix from first 2 letters of company name
  let companyPrefix = 'CO'; // Default if no company name
  if (company?.company_name && company.company_name.trim()) {
    const words = company.company_name.trim().split(/\s+/).filter((w: string) => w.length > 0);
    if (words.length >= 2) {
      // Take first letter of first two words (e.g., "Valor Engineering" -> "VE")
      companyPrefix = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      // Take first two letters of single word (e.g., "Valor" -> "VA")
      companyPrefix = words[0].substring(0, 2).toUpperCase();
    } else if (words.length === 1 && words[0].length === 1) {
      // Single letter company name, use it twice
      companyPrefix = (words[0][0] + words[0][0]).toUpperCase();
    }
  }
  
  console.log('🔵 Company prefix:', companyPrefix);

  // Get current year
  const currentYear = new Date().getFullYear();
  console.log('🔵 Current year:', currentYear);

  // Get all bills for this user to find the last one with new format
  const { data: allBills, error } = await supabase
    .from('bills')
    .select('bill_no, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('🔴 Error fetching bills:', error);
    throw error;
  }

  console.log('🔵 Total bills found:', allBills?.length || 0);
  if (allBills && allBills.length > 0) {
    console.log('🔵 First 5 bills:', allBills.slice(0, 5).map(b => b.bill_no));
  }

  if (!allBills || allBills.length === 0) {
    // First bill: PREFIX/001/YEAR
    const firstBillNo = `${companyPrefix}/001/${currentYear}`;
    console.log('✅ No bills found, generating first bill number:', firstBillNo);
    return firstBillNo;
  }

  // Find the last bill with new format (PREFIX/NNN/YEAR)
  let lastNewFormatBill = null;
  let lastSerial = 0;
  let lastYear = currentYear;

  for (const bill of allBills) {
    const newFormatMatch = bill.bill_no.match(/([A-Z]+)\/(\d+)\/(\d{4})/);
    if (newFormatMatch) {
      lastNewFormatBill = bill;
      lastSerial = parseInt(newFormatMatch[2], 10);
      lastYear = parseInt(newFormatMatch[3], 10);
      console.log('✅ Found last new format bill:', bill.bill_no, 'Serial:', lastSerial, 'Year:', lastYear);
      break; // Found the most recent new format bill
    }
  }

  if (lastNewFormatBill) {
    // Reset serial number if year changed
    if (lastYear !== currentYear) {
      const resetBillNo = `${companyPrefix}/001/${currentYear}`;
      console.log('✅ Year changed, resetting to 001. New bill number:', resetBillNo);
      return resetBillNo;
    }
    
    // Increment serial number
    const nextSerial = lastSerial + 1;
    const nextBillNo = `${companyPrefix}/${nextSerial.toString().padStart(3, '0')}/${currentYear}`;
    console.log('✅ Incrementing serial, next bill number:', nextBillNo);
    return nextBillNo;
  } else {
    // No new format bills found, start fresh with new format
    const freshBillNo = `${companyPrefix}/001/${currentYear}`;
    console.log('✅ No new format bills found, starting fresh:', freshBillNo);
    return freshBillNo;
  }
}

export async function createBill(billData: BillForm): Promise<Bill> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const billNo = await getNextBillNo();

  // Calculate totals
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  const itemsToInsert: Omit<BillItem, 'id' | 'bill_id' | 'created_at'>[] = [];

  for (const item of billData.items) {
    const lineSubtotal = item.quantity * item.unit_price;
    const cgstAmount = (lineSubtotal * item.cgst_rate) / 100;
    const sgstAmount = (lineSubtotal * item.sgst_rate) / 100;
    const lineTotal = lineSubtotal + cgstAmount + sgstAmount;

    subtotal += lineSubtotal;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;

    itemsToInsert.push({
      item_name: item.item_name,
      hsn_code: item.hsn_code || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      cgst_rate: item.cgst_rate,
      sgst_rate: item.sgst_rate,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      line_total: lineTotal,
    });
  }

  const grandTotal = subtotal + totalCgst + totalSgst;

  // Insert bill
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .insert({
      user_id: userId,
      bill_no: billNo,
      bill_date: billData.bill_date,
      customer_name: billData.customer_name,
      customer_address: billData.customer_address || null,
      customer_gst_number: billData.customer_gst_number || null,
      customer_email: billData.customer_email || null,
      po_number: billData.po_number || null,
      payment_status: billData.payment_status || 'pending',
      payment_reminder: billData.payment_reminder || 'none',
      subtotal,
      total_cgst: totalCgst,
      total_sgst: totalSgst,
      grand_total: grandTotal,
    })
    .select()
    .single();

  if (billError) throw billError;

  // Insert bill items
  const itemsWithBillId = itemsToInsert.map((item) => ({
    ...item,
    bill_id: bill.id,
  }));

  const { error: itemsError } = await supabase.from('bill_items').insert(itemsWithBillId);

  if (itemsError) throw itemsError;

  // Update stock quantities (decrement)
  for (const item of billData.items) {
    await updateStockQuantity(item.item_name, item.hsn_code, -item.quantity);
  }

  return bill;
}

export async function updateBillPaymentStatus(billId: string, status: 'pending' | 'paid' | 'unpaid'): Promise<void> {
  const { error } = await supabase
    .from('bills')
    .update({ payment_status: status, updated_at: new Date().toISOString() })
    .eq('id', billId);

  if (error) throw error;
}

export async function getBillsByDateRange(startDate: string, endDate: string): Promise<BillWithItems[]> {
  const { data: bills, error: billsError } = await supabase
    .from('bills')
    .select('*')
    .gte('bill_date', startDate)
    .lte('bill_date', endDate)
    .order('bill_date', { ascending: true });

  if (billsError) throw billsError;
  if (!bills || bills.length === 0) return [];

  // Fetch items for all bills
  const billIds = bills.map(b => b.id);
  const { data: items, error: itemsError } = await supabase
    .from('bill_items')
    .select('*')
    .in('bill_id', billIds);

  if (itemsError) throw itemsError;

  // Combine bills with their items
  return bills.map(bill => ({
    ...bill,
    bill_items: Array.isArray(items) ? items.filter(item => item.bill_id === bill.id) : [],
  }));
}

// ============ Purchase Order APIs ============
export async function getMyPurchaseOrders(limit = 100, offset = 0): Promise<PurchaseOrder[]> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*')
    .order('po_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getRecentPurchaseOrders(limit = 5): Promise<PurchaseOrder[]> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getPurchaseOrderById(poId: string): Promise<PurchaseOrderWithItems | null> {
  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .select('*')
    .eq('id', poId)
    .maybeSingle();

  if (poError) throw poError;
  if (!po) return null;

  const { data: items, error: itemsError } = await supabase
    .from('purchase_order_items')
    .select('*')
    .eq('po_id', poId)
    .order('created_at', { ascending: true });

  if (itemsError) throw itemsError;

  return {
    ...po,
    purchase_order_items: Array.isArray(items) ? items : [],
  };
}

export async function getNextPONo(): Promise<string> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get company details for prefix
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('user_id', userId)
    .maybeSingle();

  // Generate company prefix from first 2 letters of company name
  let companyPrefix = 'CO'; // Default if no company name
  if (company?.company_name && company.company_name.trim()) {
    const words = company.company_name.trim().split(/\s+/).filter((w: string) => w.length > 0);
    if (words.length >= 2) {
      // Take first letter of first two words (e.g., "Valor Engineering" -> "VE")
      companyPrefix = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      // Take first two letters of single word (e.g., "Valor" -> "VA")
      companyPrefix = words[0].substring(0, 2).toUpperCase();
    } else if (words.length === 1 && words[0].length === 1) {
      // Single letter company name, use it twice
      companyPrefix = (words[0][0] + words[0][0]).toUpperCase();
    }
  }

  // Get current year
  const currentYear = new Date().getFullYear();

  // Get all POs for this user to find the last one with new format
  const { data: allPOs, error } = await supabase
    .from('purchase_orders')
    .select('po_no, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching POs:', error);
    throw error;
  }

  if (!allPOs || allPOs.length === 0) {
    // First PO: PREFIX/P001/YEAR (P for Purchase)
    console.log('No POs found, generating first PO number:', `${companyPrefix}/P001/${currentYear}`);
    return `${companyPrefix}/P001/${currentYear}`;
  }

  // Find the last PO with new format (PREFIX/PNNN/YEAR)
  let lastNewFormatPO = null;
  let lastSerial = 0;
  let lastYear = currentYear;

  for (const po of allPOs) {
    const newFormatMatch = po.po_no.match(/([A-Z]+)\/P(\d+)\/(\d{4})/);
    if (newFormatMatch) {
      lastNewFormatPO = po;
      lastSerial = parseInt(newFormatMatch[2], 10);
      lastYear = parseInt(newFormatMatch[3], 10);
      console.log('Found last new format PO:', po.po_no, 'Serial:', lastSerial, 'Year:', lastYear);
      break; // Found the most recent new format PO
    }
  }

  if (lastNewFormatPO) {
    // Reset serial number if year changed
    if (lastYear !== currentYear) {
      console.log('Year changed, resetting to P001');
      return `${companyPrefix}/P001/${currentYear}`;
    }
    
    // Increment serial number
    const nextSerial = lastSerial + 1;
    const nextPONo = `${companyPrefix}/P${nextSerial.toString().padStart(3, '0')}/${currentYear}`;
    console.log('Incrementing serial, next PO number:', nextPONo);
    return nextPONo;
  } else {
    // No new format POs found, start fresh with new format
    console.log('No new format POs found, starting fresh:', `${companyPrefix}/P001/${currentYear}`);
    return `${companyPrefix}/P001/${currentYear}`;
  }
}

export async function createPurchaseOrder(poData: PurchaseOrderForm): Promise<PurchaseOrder> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const poNo = await getNextPONo();

  // Calculate totals
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  const itemsToInsert: Omit<PurchaseOrderItem, 'id' | 'po_id' | 'created_at'>[] = [];

  for (const item of poData.items) {
    const lineSubtotal = item.quantity * item.unit_price;
    const cgstAmount = (lineSubtotal * item.cgst_rate) / 100;
    const sgstAmount = (lineSubtotal * item.sgst_rate) / 100;
    const lineTotal = lineSubtotal + cgstAmount + sgstAmount;

    subtotal += lineSubtotal;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;

    itemsToInsert.push({
      item_name: item.item_name,
      hsn_code: item.hsn_code || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      cgst_rate: item.cgst_rate,
      sgst_rate: item.sgst_rate,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      line_total: lineTotal,
    });
  }

  const grandTotal = subtotal + totalCgst + totalSgst;

  // Insert purchase order
  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert({
      user_id: userId,
      po_no: poNo,
      invoice_no: poData.invoice_no || null,
      po_date: poData.po_date,
      supplier_name: poData.supplier_name,
      supplier_contact: poData.supplier_contact || null,
      supplier_address: poData.supplier_address || null,
      supplier_gst_number: poData.supplier_gst_number || null,
      subtotal,
      total_cgst: totalCgst,
      total_sgst: totalSgst,
      grand_total: grandTotal,
    })
    .select()
    .single();

  if (poError) throw poError;

  // Insert PO items
  const itemsWithPOId = itemsToInsert.map((item) => ({
    ...item,
    po_id: po.id,
  }));

  const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsWithPOId);

  if (itemsError) throw itemsError;

  // Update stock quantities (increment)
  for (const item of poData.items) {
    await updateStockQuantity(item.item_name, item.hsn_code, item.quantity);
  }

  return po;
}

export async function getPurchaseOrdersByDateRange(startDate: string, endDate: string): Promise<PurchaseOrderWithItems[]> {
  const { data: pos, error: posError } = await supabase
    .from('purchase_orders')
    .select('*')
    .gte('po_date', startDate)
    .lte('po_date', endDate)
    .order('po_date', { ascending: true });

  if (posError) throw posError;
  if (!pos || pos.length === 0) return [];

  // Fetch items for all purchase orders
  const poIds = pos.map(po => po.id);
  const { data: items, error: itemsError } = await supabase
    .from('purchase_order_items')
    .select('*')
    .in('po_id', poIds);

  if (itemsError) throw itemsError;

  // Combine POs with their items
  return pos.map(po => ({
    ...po,
    purchase_order_items: Array.isArray(items) ? items.filter(item => item.po_id === po.id) : [],
  }));
}

// ============ Stock APIs ============
export async function getMyStockItems(): Promise<StockItem[]> {
  const { data, error } = await supabase
    .from('stock_items')
    .select('*')
    .order('item_name', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getLowStockItems(): Promise<StockItem[]> {
  const { data, error } = await supabase
    .from('stock_items')
    .select('*')
    .filter('quantity', 'lte', 'low_stock_threshold')
    .order('item_name', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createStockItem(stockData: StockItemForm): Promise<StockItem> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('stock_items')
    .insert({
      user_id: userId,
      ...stockData,
      hsn_code: stockData.hsn_code || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStockItem(stockId: string, stockData: Partial<StockItemForm>): Promise<StockItem> {
  const { data, error } = await supabase
    .from('stock_items')
    .update({ ...stockData, updated_at: new Date().toISOString() })
    .eq('id', stockId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStockItem(stockId: string): Promise<void> {
  const { error } = await supabase.from('stock_items').delete().eq('id', stockId);

  if (error) throw error;
}

async function updateStockQuantity(itemName: string, hsnCode: string, quantityChange: number): Promise<void> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  // Find existing stock item
  const { data: existing, error: findError } = await supabase
    .from('stock_items')
    .select('*')
    .eq('user_id', userId)
    .eq('item_name', itemName)
    .eq('hsn_code', hsnCode || null)
    .maybeSingle();

  if (findError) throw findError;

  if (existing) {
    // Update existing
    const newQuantity = existing.quantity + quantityChange;
    const { error: updateError } = await supabase
      .from('stock_items')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (updateError) throw updateError;
  } else if (quantityChange > 0) {
    // Create new stock item (only for positive quantities)
    const { error: insertError } = await supabase.from('stock_items').insert({
      user_id: userId,
      item_name: itemName,
      hsn_code: hsnCode || null,
      quantity: quantityChange,
      unit: 'pcs',
      low_stock_threshold: 10,
    });

    if (insertError) throw insertError;
  }
}

// ============ Dashboard APIs ============
export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const [billsCount, posCount, stockCount, lowStockCount] = await Promise.all([
    supabase.from('bills').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('purchase_orders').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('stock_items').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('stock_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .filter('quantity', 'lte', 'low_stock_threshold'),
  ]);

  return {
    total_bills: billsCount.count || 0,
    total_purchase_orders: posCount.count || 0,
    total_stock_items: stockCount.count || 0,
    low_stock_items: lowStockCount.count || 0,
  };
}

// ============ Reports APIs ============
export async function getReportData(startDate: string, endDate: string): Promise<ReportData[]> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get bills in date range with GST details
  const { data: bills, error: billsError } = await supabase
    .from('bills')
    .select('bill_date, grand_total, total_cgst, total_sgst, subtotal')
    .eq('user_id', userId)
    .gte('bill_date', startDate)
    .lte('bill_date', endDate)
    .order('bill_date', { ascending: true });

  if (billsError) throw billsError;

  // Get purchase orders in date range with GST details
  const { data: pos, error: posError } = await supabase
    .from('purchase_orders')
    .select('po_date, grand_total, total_cgst, total_sgst, subtotal')
    .eq('user_id', userId)
    .gte('po_date', startDate)
    .lte('po_date', endDate)
    .order('po_date', { ascending: true });

  if (posError) throw posError;

  // Get expenses in date range
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('expense_date, amount')
    .eq('user_id', userId)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .order('expense_date', { ascending: true });

  if (expensesError) throw expensesError;

  // Aggregate by date
  const dataMap = new Map<string, { 
    sales: number; 
    purchases: number;
    expenses: number;
    salesGst: number; 
    purchasesGst: number;
    salesWithoutGst: number;
    purchasesWithoutGst: number;
  }>();

  (bills || []).forEach((bill) => {
    const existing = dataMap.get(bill.bill_date) || { 
      sales: 0, 
      purchases: 0,
      expenses: 0,
      salesGst: 0, 
      purchasesGst: 0,
      salesWithoutGst: 0,
      purchasesWithoutGst: 0
    };
    existing.sales += Number(bill.grand_total);
    existing.salesGst += Number(bill.total_cgst) + Number(bill.total_sgst);
    existing.salesWithoutGst += Number(bill.subtotal);
    dataMap.set(bill.bill_date, existing);
  });

  (pos || []).forEach((po) => {
    const existing = dataMap.get(po.po_date) || { 
      sales: 0, 
      purchases: 0,
      expenses: 0,
      salesGst: 0, 
      purchasesGst: 0,
      salesWithoutGst: 0,
      purchasesWithoutGst: 0
    };
    existing.purchases += Number(po.grand_total);
    existing.purchasesGst += Number(po.total_cgst) + Number(po.total_sgst);
    existing.purchasesWithoutGst += Number(po.subtotal);
    dataMap.set(po.po_date, existing);
  });

  (expenses || []).forEach((expense) => {
    const existing = dataMap.get(expense.expense_date) || { 
      sales: 0, 
      purchases: 0,
      expenses: 0,
      salesGst: 0, 
      purchasesGst: 0,
      salesWithoutGst: 0,
      purchasesWithoutGst: 0
    };
    existing.expenses += Number(expense.amount);
    dataMap.set(expense.expense_date, existing);
  });

  // Convert to array
  const result: ReportData[] = [];
  dataMap.forEach((value, key) => {
    result.push({
      period: key,
      total_sales: value.sales,
      total_purchases: value.purchases,
      total_expenses: value.expenses,
      sales_gst: value.salesGst,
      purchases_gst: value.purchasesGst,
      sales_without_gst: value.salesWithoutGst,
      purchases_without_gst: value.purchasesWithoutGst,
    });
  });

  return result.sort((a, b) => a.period.localeCompare(b.period));
}

// ============ Work Logs APIs ============
export async function getMyWorkLogs(limit = 100, offset = 0): Promise<any[]> {
  const { data, error } = await supabase
    .from('work_logs')
    .select('*')
    .order('log_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getWorkLogsByDateRange(startDate: string, endDate: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('work_logs')
    .select('*')
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createWorkLog(logData: any): Promise<any> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('work_logs')
    .insert({
      user_id: userId,
      ...logData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkLog(logId: string, logData: any): Promise<any> {
  const { data, error } = await supabase
    .from('work_logs')
    .update({ ...logData, updated_at: new Date().toISOString() })
    .eq('id', logId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorkLog(logId: string): Promise<void> {
  const { error } = await supabase.from('work_logs').delete().eq('id', logId);

  if (error) throw error;
}

export async function getWorkSummary(startDate: string, endDate: string): Promise<any> {
  const logs = await getWorkLogsByDateRange(startDate, endDate);

  let totalOutsourceHours = 0;
  let totalInhouseHours = 0;
  let totalJobs = 0;

  logs.forEach((log) => {
    if (log.work_type === 'outsource') {
      totalOutsourceHours += Number(log.machine_hours);
    } else {
      totalInhouseHours += Number(log.machine_hours);
    }
    totalJobs += log.jobs_completed;
  });

  return {
    total_outsource_hours: totalOutsourceHours,
    total_inhouse_hours: totalInhouseHours,
    total_jobs: totalJobs,
    total_logs: logs.length,
  };
}

// ==================== CUSTOMERS ====================

export async function getMyCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('company_name', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getCustomerById(customerId: string): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Customer not found');
  return data;
}

export async function createCustomer(customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: user.id,
      ...customerData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(customerId: string, customerData: Partial<Customer>): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .update({ ...customerData, updated_at: new Date().toISOString() })
    .eq('id', customerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('id', customerId);
  if (error) throw error;
}

// ==================== SUPPLIERS ====================

export async function getMySuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('company_name', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getSupplierById(supplierId: string): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Supplier not found');
  return data;
}

export async function createSupplier(supplierData: Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      user_id: user.id,
      ...supplierData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSupplier(supplierId: string, supplierData: Partial<Supplier>): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .update({ ...supplierData, updated_at: new Date().toISOString() })
    .eq('id', supplierId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSupplier(supplierId: string): Promise<void> {
  const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
  if (error) throw error;
}

// ==================== SUPPORT TICKETS ====================

export async function createSupportTicket(ticketData: { subject: string; message: string }): Promise<SupportTicket> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id,
      ...ticketData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMySupportTickets(): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ==================== DELIVERY CHALLANS ====================

export async function getMyChallansByDateRange(startDate: string, endDate: string): Promise<DeliveryChallan[]> {
  const { data, error } = await supabase
    .from('delivery_challans')
    .select('*')
    .gte('challan_date', startDate)
    .lte('challan_date', endDate)
    .order('challan_date', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getMyChallans(): Promise<DeliveryChallan[]> {
  const { data, error } = await supabase
    .from('delivery_challans')
    .select('*')
    .order('challan_date', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getChallanById(challanId: string): Promise<DeliveryChallanWithItems> {
  const { data: challan, error: challanError } = await supabase
    .from('delivery_challans')
    .select('*')
    .eq('id', challanId)
    .maybeSingle();

  if (challanError) throw challanError;
  if (!challan) throw new Error('Delivery challan not found');

  const { data: items, error: itemsError } = await supabase
    .from('delivery_challan_items')
    .select('*')
    .eq('challan_id', challanId)
    .order('created_at', { ascending: true });

  if (itemsError) throw itemsError;

  return {
    ...challan,
    challan_items: Array.isArray(items) ? items : [],
  };
}

export async function createChallan(challanData: DeliveryChallanForm): Promise<DeliveryChallan> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get company details for prefix
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('user_id', user.id)
    .maybeSingle();

  // Generate company prefix from first 2 letters of company name
  let companyPrefix = 'CO'; // Default if no company name
  if (company?.company_name && company.company_name.trim()) {
    const words = company.company_name.trim().split(/\s+/).filter((w: string) => w.length > 0);
    if (words.length >= 2) {
      // Take first letter of first two words (e.g., "Valor Engineering" -> "VE")
      companyPrefix = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      // Take first two letters of single word (e.g., "Valor" -> "VA")
      companyPrefix = words[0].substring(0, 2).toUpperCase();
    } else if (words.length === 1 && words[0].length === 1) {
      // Single letter company name, use it twice
      companyPrefix = (words[0][0] + words[0][0]).toUpperCase();
    }
  }

  // Get current year
  const currentYear = new Date().getFullYear();

  // Get all challans for this user to find the last one with new format
  const { data: allChallans } = await supabase
    .from('delivery_challans')
    .select('challan_no, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  let challanNo = `${companyPrefix}/DC001/${currentYear}`; // DC for Delivery Challan
  
  if (allChallans && allChallans.length > 0) {
    // Find the last challan with new format (PREFIX/DCNNN/YEAR)
    let lastNewFormatChallan = null;
    let lastSerial = 0;
    let lastYear = currentYear;

    for (const challan of allChallans) {
      const newFormatMatch = challan.challan_no.match(/([A-Z]+)\/DC(\d+)\/(\d{4})/);
      if (newFormatMatch) {
        lastNewFormatChallan = challan;
        lastSerial = parseInt(newFormatMatch[2], 10);
        lastYear = parseInt(newFormatMatch[3], 10);
        console.log('Found last new format challan:', challan.challan_no, 'Serial:', lastSerial, 'Year:', lastYear);
        break; // Found the most recent new format challan
      }
    }

    if (lastNewFormatChallan) {
      // Reset serial number if year changed
      if (lastYear !== currentYear) {
        console.log('Year changed, resetting to DC001');
        challanNo = `${companyPrefix}/DC001/${currentYear}`;
      } else {
        // Increment serial number
        const nextSerial = lastSerial + 1;
        challanNo = `${companyPrefix}/DC${nextSerial.toString().padStart(3, '0')}/${currentYear}`;
        console.log('Incrementing serial, next challan number:', challanNo);
      }
    } else {
      // No new format challans found, start fresh with new format
      console.log('No new format challans found, starting fresh:', challanNo);
    }
  } else {
    console.log('No challans found, generating first challan number:', challanNo);
  }

  const { items, ...challanInfo } = challanData;

  const { data: newChallan, error: challanError } = await supabase
    .from('delivery_challans')
    .insert({
      user_id: user.id,
      challan_no: challanNo,
      ...challanInfo,
    })
    .select()
    .single();

  if (challanError) throw challanError;

  if (items && items.length > 0) {
    const challanItems = items.map((item) => ({
      challan_id: newChallan.id,
      ...item,
    }));

    const { error: itemsError } = await supabase
      .from('delivery_challan_items')
      .insert(challanItems);

    if (itemsError) throw itemsError;
  }

  return newChallan;
}

export async function deleteChallan(challanId: string): Promise<void> {
  const { error } = await supabase.from('delivery_challans').delete().eq('id', challanId);
  if (error) throw error;
}

// ==================== SUBSCRIPTION & PAYMENT ====================

export async function getMySubscription(): Promise<Subscription | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllSubscriptions(): Promise<SubscriptionWithUser[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      user:profiles!subscriptions_user_id_fkey(username, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getMyTransactions(): Promise<Transaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getAllTransactions(): Promise<TransactionWithUser[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      user:profiles!transactions_user_id_fkey(username, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createTransaction(transactionData: {
  transaction_id: string;
  razorpay_order_id?: string;
  amount: number;
  plan_type: 'monthly' | 'yearly';
}): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      ...transactionData,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  paymentDetails?: {
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    payment_method?: string;
  }
): Promise<void> {
  const updateData: any = { status, updated_at: new Date().toISOString() };
  if (paymentDetails) {
    Object.assign(updateData, paymentDetails);
  }

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('transaction_id', transactionId);

  if (error) throw error;
}

export async function activateSubscription(
  planType: 'monthly' | 'yearly',
  transactionId: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Calculate end date
  const startDate = new Date();
  const endDate = new Date();
  if (planType === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // Create subscription record
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      plan_type: planType,
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    })
    .select()
    .single();

  if (subError) throw subError;

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_plan: planType,
      subscription_status: 'active',
      subscription_start_date: startDate.toISOString(),
      subscription_end_date: endDate.toISOString(),
    })
    .eq('id', user.id);

  if (profileError) throw profileError;

  // Link transaction to subscription
  const { error: txError } = await supabase
    .from('transactions')
    .update({ subscription_id: subscription.id })
    .eq('transaction_id', transactionId);

  if (txError) throw txError;
}

export async function checkSubscriptionStatus(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, subscription_plan, subscription_status, subscription_end_date')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return false;

  // Admin always has premium access
  if (profile.role === 'admin') return true;

  // Check if subscription is active and not expired
  if (profile.subscription_plan !== 'free' && profile.subscription_status === 'active') {
    if (profile.subscription_end_date) {
      const endDate = new Date(profile.subscription_end_date);
      return endDate > new Date();
    }
  }

  return false;
}

