import { supabase } from './supabase';
import { createWorkOrder } from './workOrder';
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
  MaterialInventoryMovement,
  MaterialInventoryMovementForm,
  InwardEntry,
  InwardEntryForm,
  AvailableInwardItem,
  Customer,
  Supplier,
  SupportTicket,
  DeliveryChallan,
  DeliveryChallanWithItems,
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
  CashMemo,
  CashMemoForm,
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

export async function getMyBillsWithItemsByCustomer(customerName: string): Promise<BillWithItems[]> {
  const { data: bills, error: billsError } = await supabase
    .from('bills')
    .select('*')
    .eq('customer_name', customerName)
    .order('bill_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (billsError) throw billsError;
  if (!bills || bills.length === 0) return [];

  const billIds = bills.map((bill) => bill.id);
  const { data: items, error: itemsError } = await supabase
    .from('bill_items')
    .select('*')
    .in('bill_id', billIds)
    .order('created_at', { ascending: true });

  if (itemsError) throw itemsError;

  return bills.map((bill) => ({
    ...bill,
    bill_items: Array.isArray(items) ? items.filter((item) => item.bill_id === bill.id) : [],
  }));
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
  let totalIgst = 0;

  const itemsToInsert: Omit<BillItem, 'id' | 'bill_id' | 'created_at'>[] = [];

  for (const item of billData.items) {
    const lineSubtotal = item.quantity * item.unit_price;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let lineTotal = lineSubtotal;

    if (billData.gst_type === 'cgst_sgst') {
      cgstAmount = (lineSubtotal * item.cgst_rate) / 100;
      sgstAmount = (lineSubtotal * item.sgst_rate) / 100;
      lineTotal = lineSubtotal + cgstAmount + sgstAmount;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
    } else {
      igstAmount = (lineSubtotal * item.igst_rate) / 100;
      lineTotal = lineSubtotal + igstAmount;
      totalIgst += igstAmount;
    }

    subtotal += lineSubtotal;

    itemsToInsert.push({
      item_name: item.item_name,
      hsn_code: item.hsn_code || null,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      cgst_rate: item.cgst_rate,
      sgst_rate: item.sgst_rate,
      igst_rate: item.igst_rate,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_amount: igstAmount,
      line_total: lineTotal,
    });
  }

  const gstTotal = billData.gst_type === 'cgst_sgst' ? totalCgst + totalSgst : totalIgst;
  const amountBeforeTcs = subtotal + gstTotal;
  const tcsAmount = billData.tcs_applicable ? (amountBeforeTcs * 2) / 100 : 0;
  const grandTotal = amountBeforeTcs + tcsAmount;

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
      gst_type: billData.gst_type,
      payment_status: billData.payment_status || 'pending',
      payment_reminder: billData.payment_reminder || 'none',
      subtotal,
      total_cgst: totalCgst,
      total_sgst: totalSgst,
      total_igst: totalIgst,
      tcs_applicable: billData.tcs_applicable,
      tcs_amount: tcsAmount,
      grand_total: grandTotal,
      notes: billData.notes?.trim() || null,
      notes_format: billData.notes_format,
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
    await createMaterialInventoryMovement({
      movement_type: 'out',
      movement_date: billData.bill_date,
      item_name: item.item_name,
      hsn_code: item.hsn_code,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      party_name: billData.customer_name,
      document_number: bill.bill_no,
      purchase_order_number: billData.po_number || '',
      document_type: 'bill',
      notes: billData.po_number ? `PO: ${billData.po_number}` : '',
    }, { source: 'bill', documentId: bill.id });
  }

  return bill;
}

export async function updateBill(billId: string, billData: BillForm, oldBillItems?: BillItem[]): Promise<Bill> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  // Calculate totals
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const itemsToInsert: Omit<BillItem, 'id' | 'bill_id' | 'created_at'>[] = [];

  for (const item of billData.items) {
    const lineSubtotal = item.quantity * item.unit_price;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let lineTotal = lineSubtotal;

    if (billData.gst_type === 'cgst_sgst') {
      cgstAmount = (lineSubtotal * item.cgst_rate) / 100;
      sgstAmount = (lineSubtotal * item.sgst_rate) / 100;
      lineTotal = lineSubtotal + cgstAmount + sgstAmount;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
    } else {
      igstAmount = (lineSubtotal * item.igst_rate) / 100;
      lineTotal = lineSubtotal + igstAmount;
      totalIgst += igstAmount;
    }

    subtotal += lineSubtotal;

    itemsToInsert.push({
      item_name: item.item_name,
      hsn_code: item.hsn_code || null,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      cgst_rate: item.cgst_rate,
      sgst_rate: item.sgst_rate,
      igst_rate: item.igst_rate,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_amount: igstAmount,
      line_total: lineTotal,
    });
  }

  const gstTotal = billData.gst_type === 'cgst_sgst' ? totalCgst + totalSgst : totalIgst;
  const amountBeforeTcs = subtotal + gstTotal;
  const tcsAmount = billData.tcs_applicable ? (amountBeforeTcs * 2) / 100 : 0;
  const grandTotal = amountBeforeTcs + tcsAmount;

  // Update bill
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .update({
      bill_date: billData.bill_date,
      customer_name: billData.customer_name,
      customer_address: billData.customer_address || null,
      customer_gst_number: billData.customer_gst_number || null,
      customer_email: billData.customer_email || null,
      po_number: billData.po_number || null,
      gst_type: billData.gst_type,
      payment_status: billData.payment_status || 'pending',
      payment_reminder: billData.payment_reminder || 'none',
      subtotal,
      total_cgst: totalCgst,
      total_sgst: totalSgst,
      total_igst: totalIgst,
      tcs_applicable: billData.tcs_applicable,
      tcs_amount: tcsAmount,
      grand_total: grandTotal,
      notes: billData.notes?.trim() || null,
      notes_format: billData.notes_format,
      updated_at: new Date().toISOString(),
    })
    .eq('id', billId)
    .select()
    .single();

  if (billError) throw billError;

  // Delete old bill items
  const { error: deleteError } = await supabase
    .from('bill_items')
    .delete()
    .eq('bill_id', billId);

  if (deleteError) throw deleteError;

  // Insert new bill items
  const itemsWithBillId = itemsToInsert.map((item) => ({
    ...item,
    bill_id: billId,
  }));

  const { error: itemsError } = await supabase.from('bill_items').insert(itemsWithBillId);

  if (itemsError) throw itemsError;

  // Handle stock quantity adjustments
  if (oldBillItems) {
    for (const oldItem of oldBillItems) {
      const newItem = billData.items.find(i => i.item_name === oldItem.item_name && i.hsn_code === oldItem.hsn_code);
      const quantityDifference = newItem ? newItem.quantity - oldItem.quantity : -oldItem.quantity;
      
      if (quantityDifference !== 0 && oldItem.hsn_code) {
        await updateStockQuantity(oldItem.item_name, oldItem.hsn_code, -quantityDifference);
      }
    }
  }

  return bill;
}

export async function updateBillPaymentStatus(
  billId: string,
  status: 'pending' | 'paid' | 'unpaid',
  paymentDate?: string
): Promise<void> {
  const paymentConfirmedAt = status === 'paid'
    ? new Date(`${paymentDate || new Date().toISOString().slice(0, 10)}T12:00:00`).toISOString()
    : null;

  const { error } = await supabase
    .from('bills')
    .update({
      payment_status: status,
      payment_confirmed_at: paymentConfirmedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', billId);

  if (error) throw error;
}

export async function deleteBill(billId: string): Promise<void> {
  const { error } = await supabase.from('bills').delete().eq('id', billId);
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

export async function getBillsByPaymentDateRange(startDate: string, endDate: string): Promise<BillWithItems[]> {
  const { data: bills, error: billsError } = await supabase
    .from('bills')
    .select('*')
    .eq('payment_status', 'paid')
    .gte('payment_confirmed_at', `${startDate}T00:00:00.000Z`)
    .lte('payment_confirmed_at', `${endDate}T23:59:59.999Z`)
    .order('payment_confirmed_at', { ascending: true });

  if (billsError) throw billsError;
  if (!bills || bills.length === 0) return [];

  const billIds = bills.map((bill) => bill.id);
  const { data: items, error: itemsError } = await supabase
    .from('bill_items')
    .select('*')
    .in('bill_id', billIds);

  if (itemsError) throw itemsError;

  return bills.map((bill) => ({
    ...bill,
    bill_items: Array.isArray(items) ? items.filter((item) => item.bill_id === bill.id) : [],
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

export async function updatePurchaseOrderPaymentStatus(
  poId: string,
  paymentStatus: 'paid' | 'unpaid',
  paymentDate?: string
): Promise<void> {
  const paymentConfirmedAt = paymentStatus === 'paid'
    ? new Date(`${paymentDate || new Date().toISOString().slice(0, 10)}T12:00:00`).toISOString()
    : null;

  const { error } = await supabase
    .from('purchase_orders')
    .update({
      payment_status: paymentStatus,
      payment_confirmed_at: paymentConfirmedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', poId);

  if (error) throw error;
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
  let totalIgst = 0;

  const itemsToInsert: Omit<PurchaseOrderItem, 'id' | 'po_id' | 'created_at'>[] = [];

  for (const item of poData.items) {
    const lineSubtotal = item.quantity * item.unit_price;
    const cgstAmount = poData.gst_type === 'cgst_sgst' ? (lineSubtotal * item.cgst_rate) / 100 : 0;
    const sgstAmount = poData.gst_type === 'cgst_sgst' ? (lineSubtotal * item.sgst_rate) / 100 : 0;
    const igstAmount = poData.gst_type === 'igst' ? (lineSubtotal * item.igst_rate) / 100 : 0;
    const lineTotal = lineSubtotal + cgstAmount + sgstAmount + igstAmount;

    subtotal += lineSubtotal;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;
    totalIgst += igstAmount;

    itemsToInsert.push({
      item_name: item.item_name,
      hsn_code: item.hsn_code || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      cgst_rate: item.cgst_rate,
      sgst_rate: item.sgst_rate,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_rate: item.igst_rate,
      igst_amount: igstAmount,
      line_total: lineTotal,
    });
  }

  const grandTotal = subtotal + totalCgst + totalSgst + totalIgst;

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
      gst_type: poData.gst_type,
      classification: poData.classification,
      status: 'pending',
      payment_status: poData.payment_status,
      payment_confirmed_at: poData.payment_status === 'paid'
        ? new Date(`${poData.po_date}T12:00:00`).toISOString()
        : null,
      subtotal,
      total_cgst: totalCgst,
      total_sgst: totalSgst,
      total_igst: totalIgst,
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

  // Handle classification-based logic
  if (poData.classification === 'stock') {
    // Update stock quantities (increment) only for stock classification
    for (const item of poData.items) {
      await createMaterialInventoryMovement({
        movement_type: 'in',
        movement_date: poData.po_date,
        item_name: item.item_name,
        hsn_code: item.hsn_code,
        quantity: item.quantity,
        unit: 'pcs',
        unit_price: item.unit_price,
        party_name: poData.supplier_name,
        document_number: poNo,
        purchase_order_number: poNo,
        document_type: 'purchase_order',
        notes: poData.invoice_no ? `Invoice: ${poData.invoice_no}` : '',
      }, { source: 'purchase_order', documentId: po.id });
    }
  } else if (poData.classification === 'expense') {
    // Create expense entries for expense classification
    const expenseEntries = poData.items.map((item) => {
      const subtotal = item.quantity * item.unit_price;
      const cgstAmount = poData.gst_type === 'cgst_sgst' ? (subtotal * item.cgst_rate) / 100 : 0;
      const sgstAmount = poData.gst_type === 'cgst_sgst' ? (subtotal * item.sgst_rate) / 100 : 0;
      const igstAmount = poData.gst_type === 'igst' ? (subtotal * item.igst_rate) / 100 : 0;
      const totalAmount = subtotal + cgstAmount + sgstAmount + igstAmount;
      
      return {
        user_id: userId,
        expense_name: item.item_name,
        category: 'Purchase Order',
        amount: totalAmount,
        expense_date: poData.po_date,
        description: `PO: ${poNo} - ${item.item_name} (Qty: ${item.quantity}, HSN: ${item.hsn_code || 'N/A'})`,
      };
    });

    const { error: expenseError } = await supabase.from('expenses').insert(expenseEntries);
    if (expenseError) throw expenseError;
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

export async function updatePurchaseOrder(poId: string, poData: PurchaseOrderForm): Promise<PurchaseOrder> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  // Calculate totals
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const itemsToInsert: Omit<PurchaseOrderItem, 'id' | 'po_id' | 'created_at'>[] = [];

  for (const item of poData.items) {
    const lineSubtotal = item.quantity * item.unit_price;
    const cgstAmount = poData.gst_type === 'cgst_sgst' ? (lineSubtotal * item.cgst_rate) / 100 : 0;
    const sgstAmount = poData.gst_type === 'cgst_sgst' ? (lineSubtotal * item.sgst_rate) / 100 : 0;
    const igstAmount = poData.gst_type === 'igst' ? (lineSubtotal * item.igst_rate) / 100 : 0;
    const lineTotal = lineSubtotal + cgstAmount + sgstAmount + igstAmount;

    subtotal += lineSubtotal;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;
    totalIgst += igstAmount;

    itemsToInsert.push({
      item_name: item.item_name,
      hsn_code: item.hsn_code || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      cgst_rate: item.cgst_rate,
      sgst_rate: item.sgst_rate,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_rate: item.igst_rate,
      igst_amount: igstAmount,
      line_total: lineTotal,
    });
  }

  const grandTotal = subtotal + totalCgst + totalSgst + totalIgst;

  // Update purchase order - set status to 'revised' when updating
  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .update({
      invoice_no: poData.invoice_no || null,
      po_date: poData.po_date,
      supplier_name: poData.supplier_name,
      supplier_contact: poData.supplier_contact || null,
      supplier_address: poData.supplier_address || null,
      supplier_gst_number: poData.supplier_gst_number || null,
      gst_type: poData.gst_type,
      classification: poData.classification,
      status: 'revised',
      subtotal,
      total_cgst: totalCgst,
      total_sgst: totalSgst,
      total_igst: totalIgst,
      grand_total: grandTotal,
    })
    .eq('id', poId)
    .eq('user_id', userId)
    .select()
    .single();

  if (poError) throw poError;

  // Delete old items
  const { error: deleteError } = await supabase
    .from('purchase_order_items')
    .delete()
    .eq('po_id', poId);

  if (deleteError) throw deleteError;

  // Insert new items
  const itemsWithPOId = itemsToInsert.map((item) => ({
    ...item,
    po_id: poId,
  }));

  const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsWithPOId);

  if (itemsError) throw itemsError;

  return po;
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

export async function getMaterialInventoryMovements(): Promise<MaterialInventoryMovement[]> {
  const { data, error } = await supabase
    .from('material_inventory_movements')
    .select('*')
    .order('movement_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getInwardEntries(): Promise<InwardEntry[]> {
  const { data, error } = await supabase
    .from('inward_entries')
    .select('*, inward_items(*)')
    .order('received_date', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? data as InwardEntry[] : [];
}

export async function createConfirmedInward(
  inwardData: InwardEntryForm,
  document?: { path: string; name: string; mimeType: string; size: number },
  extraction?: { rawText: string; json: unknown },
): Promise<InwardEntry> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const { count } = await supabase.from('inward_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  const inwardNo = `IN/${String((count || 0) + 1).padStart(4, '0')}/${new Date(inwardData.received_date).getFullYear()}`;
  const { data: inward, error: inwardError } = await supabase.from('inward_entries').insert({
    user_id: userId,
    inward_no: inwardNo,
    challan_no: inwardData.challan_no || null,
    challan_date: inwardData.challan_date || null,
    document_no: inwardData.document_no || null,
    document_date: inwardData.document_date || null,
    customer_name: inwardData.customer_name,
    customer_gstin: inwardData.customer_gstin || null,
    customer_address: inwardData.customer_address || null,
    customer_state: inwardData.customer_state || null,
    customer_state_code: inwardData.customer_state_code || null,
    vehicle_no: inwardData.vehicle_no || null,
    transporter: inwardData.transporter || null,
    eway_bill_no: inwardData.eway_bill_no || null,
    eway_bill_date: inwardData.eway_bill_date || null,
    supplier_name: inwardData.supplier_name || null,
    supplier_code: inwardData.supplier_code || null,
    supplier_gstin: inwardData.supplier_gstin || null,
    po_no: inwardData.po_no || null,
    po_date: inwardData.po_date || null,
    order_no: inwardData.order_no || null,
    order_id: inwardData.order_id || null,
    job_order_no: inwardData.job_order_no || null,
    job_order_item_no: inwardData.job_order_item_no || null,
    received_date: inwardData.received_date,
    status: 'received',
    extraction_status: extraction ? 'completed' : 'pending',
    created_by: userId,
  }).select().single();
  if (inwardError) throw inwardError;

  const { error: itemsError } = await supabase.from('inward_items').insert(inwardData.items.map((item) => ({
    inward_id: inward.id,
    ...item,
    hsn_sac: item.hsn_sac || null,
    gst_rate: item.gst_rate ?? null,
    process_qty: item.process_qty ?? null,
    process_rate: item.process_rate ?? null,
    process_value: item.process_value ?? null,
    material_rate: item.material_rate ?? null,
    material_value: item.material_value ?? null,
    expected_delivery_date: item.expected_delivery_date || null,
    received_qty: item.material_qty,
  })));
  if (itemsError) throw itemsError;

  if (document) {
    const { error: documentError } = await supabase.from('inward_documents').insert({
      user_id: userId,
      inward_id: inward.id,
      object_path: document.path,
      original_filename: document.name,
      mime_type: document.mimeType,
      size_bytes: document.size,
    });
    if (documentError) throw documentError;
  }
  if (extraction) {
    const { error: extractionError } = await supabase.from('inward_extraction_logs').insert({
      user_id: userId,
      inward_id: inward.id,
      provider: 'openai',
      model: 'gpt-4o-mini',
      status: 'completed',
      raw_text: extraction.rawText,
      extracted_json: extraction.json,
    });
    if (extractionError) throw extractionError;
  }
  return inward as InwardEntry;
}

export async function createMaterialInventoryMovement(
  movementData: MaterialInventoryMovementForm,
  metadata?: { source?: MaterialInventoryMovement['source']; documentId?: string },
): Promise<MaterialInventoryMovement> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');
  if (movementData.quantity <= 0) throw new Error('Quantity must be greater than zero');

  const { data, error } = await supabase
    .from('material_inventory_movements')
    .insert({
      user_id: userId,
      ...movementData,
      document_date: movementData.document_date || null,
      purchase_order_date: movementData.purchase_order_date || null,
      eway_bill_date: movementData.eway_bill_date || null,
      expected_delivery_date: movementData.expected_delivery_date || null,
      hsn_code: movementData.hsn_code || null,
      party_name: movementData.party_name || null,
      document_number: movementData.document_number || null,
      purchase_order_number: movementData.purchase_order_number || null,
      total_amount: movementData.quantity * movementData.unit_price,
      amount: movementData.amount || movementData.quantity * movementData.unit_price,
      document_type: movementData.document_type || null,
      notes: movementData.notes || null,
      source: metadata?.source || 'manual',
      document_id: metadata?.documentId || null,
    })
    .select()
    .single();

  if (error) throw error;

  if (movementData.movement_type === 'in' && movementData.party_name && movementData.item_name) {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('company_name', movementData.party_name)
      .maybeSingle();

    await createWorkOrder({
      company_name: movementData.party_name,
      customer_id: customer?.id || '',
      job_name: movementData.item_name,
      rate_per_piece: Number(movementData.unit_price || 0),
      total_value: movementData.amount || movementData.quantity * movementData.unit_price,
      quantity_ordered: movementData.quantity,
      quantity_returned: 0,
      work_start_date: movementData.movement_date,
      completion_date: '',
      status: 'pending',
      notes: [
        'Auto-created from Material Inventory',
        movementData.purchase_order_number ? `P.O. No.: ${movementData.purchase_order_number}` : '',
        movementData.document_number ? `Document No.: ${movementData.document_number}` : '',
      ].filter(Boolean).join(' | '),
    });
  }

  await updateStockQuantity(
    movementData.item_name,
    movementData.hsn_code,
    movementData.movement_type === 'in' ? movementData.quantity : -movementData.quantity,
  );
  return data;
}

export async function updateMaterialInventoryMovement(
  movementId: string,
  movementData: MaterialInventoryMovementForm,
): Promise<MaterialInventoryMovement> {
  if (movementData.quantity <= 0) throw new Error('Quantity must be greater than zero');

  const { data: existing, error: existingError } = await supabase
    .from('material_inventory_movements')
    .select('*')
    .eq('id', movementId)
    .single();

  if (existingError) throw existingError;

  const { data, error } = await supabase
    .from('material_inventory_movements')
    .update({
      ...movementData,
      document_date: movementData.document_date || null,
      purchase_order_date: movementData.purchase_order_date || null,
      eway_bill_date: movementData.eway_bill_date || null,
      expected_delivery_date: movementData.expected_delivery_date || null,
      hsn_code: movementData.hsn_code || null,
      party_name: movementData.party_name || null,
      document_number: movementData.document_number || null,
      purchase_order_number: movementData.purchase_order_number || null,
      total_amount: movementData.quantity * movementData.unit_price,
      amount: movementData.amount || movementData.quantity * movementData.unit_price,
      document_type: movementData.document_type || null,
      notes: movementData.notes || null,
    })
    .eq('id', movementId)
    .select()
    .single();

  if (error) throw error;

  await updateStockQuantity(
    existing.item_name,
    existing.hsn_code,
    existing.movement_type === 'in' ? -Number(existing.quantity) : Number(existing.quantity),
  );
  await updateStockQuantity(
    movementData.item_name,
    movementData.hsn_code,
    movementData.movement_type === 'in' ? movementData.quantity : -movementData.quantity,
  );

  return data;
}

export async function deleteMaterialInventoryMovement(movementId: string): Promise<void> {
  const { data: existing, error: existingError } = await supabase
    .from('material_inventory_movements')
    .select('item_name, hsn_code, quantity, movement_type')
    .eq('id', movementId)
    .single();

  if (existingError) throw existingError;

  const { error } = await supabase
    .from('material_inventory_movements')
    .delete()
    .eq('id', movementId);

  if (error) throw error;

  await updateStockQuantity(
    existing.item_name,
    existing.hsn_code,
    existing.movement_type === 'in' ? -Number(existing.quantity) : Number(existing.quantity),
  );
}

export async function getAvailableMaterialInventory(companyName: string): Promise<MaterialInventoryMovement[]> {
  const { data, error } = await supabase
    .from('material_inventory_movements')
    .select('*')
    .eq('party_name', companyName)
    .eq('movement_type', 'in')
    .eq('inventory_status', 'completed')
    .order('movement_date', { ascending: true });

  if (error) throw error;
  const { data: outward, error: outwardError } = await supabase
    .from('material_inventory_movements')
    .select('item_name, quantity, source_inward_id')
    .eq('party_name', companyName)
    .eq('movement_type', 'out');

  if (outwardError) throw outwardError;
  const usedByInward = new Map<string, number>();
  const usedByItem = new Map<string, number>();
  (outward || []).forEach((movement) => {
    if (movement.source_inward_id) {
      usedByInward.set(movement.source_inward_id, (usedByInward.get(movement.source_inward_id) || 0) + Number(movement.quantity));
    }
    usedByItem.set(movement.item_name, (usedByItem.get(movement.item_name) || 0) + Number(movement.quantity));
  });

  return (data || []).filter((movement) => {
    const used = movement.id ? usedByInward.get(movement.id) || 0 : usedByItem.get(movement.item_name) || 0;
    return Number(movement.quantity) - used > 0;
  }).map((movement) => ({
    ...movement,
    quantity: Number(movement.quantity) - (movement.id ? usedByInward.get(movement.id) || 0 : usedByItem.get(movement.item_name) || 0),
  }));
}

export async function getAvailableInwardItems(companyName: string): Promise<AvailableInwardItem[]> {
  const { data, error } = await supabase
    .from('inward_entries')
    .select('id, inward_no, customer_name, status, inward_items(*)')
    .eq('customer_name', companyName)
    .not('status', 'in', '(cancelled,completed)');

  if (error) throw error;
  return (data || []).flatMap((entry: any) => (entry.inward_items || []).map((item: any) => {
    const materialQty = Number(item.material_qty || 0);
    const outwardQty = Number(item.outward_qty || 0);
    return {
      id: item.id,
      inward_id: entry.id,
      inward_no: entry.inward_no,
      customer_name: entry.customer_name,
      product_name: item.product_name,
      description: item.description,
      hsn_sac: item.hsn_sac,
      material_qty: materialQty,
      material_unit: item.material_unit || 'pcs',
      material_rate: Number(item.material_rate || 0),
      outward_qty: outwardQty,
      available_qty: Math.max(0, materialQty - outwardQty),
    };
  })).filter((item) => item.available_qty > 0);
}

export async function createOutwardForBill(input: {
  billId: string;
  billNo: string;
  outwardDate: string;
  inwardId: string;
  inwardItemId: string;
  quantity: number;
  exceptionStatus: 'completed' | 'pending' | 'in_process' | 'rejected';
  exceptionRemark: string;
}): Promise<void> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');
  const outwardNo = `OUT-${input.billNo}-${input.inwardItemId.slice(0, 6)}`;
  const { data: outward, error } = await supabase.from('outward_entries').insert({
    user_id: userId,
    outward_no: outwardNo,
    inward_id: input.inwardId,
    bill_id: input.billId,
    outward_date: input.outwardDate || null,
    status: input.exceptionStatus === 'rejected' ? 'cancelled' : 'confirmed',
    exception_status: input.exceptionStatus,
    exception_remark: input.exceptionRemark || null,
  }).select('id').single();
  if (error) throw error;

  const { error: itemError } = await supabase.from('outward_items').insert({
    outward_id: outward.id,
    inward_item_id: input.inwardItemId,
    quantity: input.quantity,
  });
  if (itemError) throw itemError;

  const { data: inwardItem, error: inwardError } = await supabase
    .from('inward_items')
    .select('material_qty, outward_qty')
    .eq('id', input.inwardItemId)
    .single();
  if (inwardError) throw inwardError;
  const newOutwardQty = Number(inwardItem.outward_qty || 0) + (input.exceptionStatus === 'rejected' ? 0 : input.quantity);
  const { error: updateError } = await supabase.from('inward_items').update({ outward_qty: newOutwardQty }).eq('id', input.inwardItemId);
  if (updateError) throw updateError;
  const inwardStatus = input.exceptionStatus === 'in_process' ? 'in_process' : input.exceptionStatus === 'pending' ? 'processing' : newOutwardQty >= Number(inwardItem.material_qty) ? 'completed' : 'partially_outward';
  await supabase.from('inward_entries').update({ status: inwardStatus, updated_at: new Date().toISOString() }).eq('id', input.inwardId);
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
export async function getReportData(
  startDate: string,
  endDate: string,
  paymentStatus: 'all' | 'paid' | 'unpaid' = 'all',
): Promise<ReportData[]> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  let billsQuery = supabase
    .from('bills')
    .select('bill_date, grand_total, total_cgst, total_sgst, total_igst, subtotal, payment_status')
    .eq('user_id', userId)
    .gte('bill_date', startDate)
    .lte('bill_date', endDate)
    .order('bill_date', { ascending: true });

  if (paymentStatus === 'paid') billsQuery = billsQuery.eq('payment_status', 'paid');
  if (paymentStatus === 'unpaid') billsQuery = billsQuery.neq('payment_status', 'paid');

  const { data: bills, error: billsError } = await billsQuery;

  if (billsError) throw billsError;

  let purchaseOrdersQuery = supabase
    .from('purchase_orders')
    .select('po_date, grand_total, total_cgst, total_sgst, total_igst, subtotal, payment_status')
    .eq('user_id', userId)
    .gte('po_date', startDate)
    .lte('po_date', endDate)
    .order('po_date', { ascending: true });

  if (paymentStatus === 'paid') purchaseOrdersQuery = purchaseOrdersQuery.eq('payment_status', 'paid');
  if (paymentStatus === 'unpaid') purchaseOrdersQuery = purchaseOrdersQuery.neq('payment_status', 'paid');

  const { data: pos, error: posError } = await purchaseOrdersQuery;

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

  const getMonthKey = (date: string) => date.slice(0, 7);

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
    const period = getMonthKey(bill.bill_date);
    const existing = dataMap.get(period) || { 
      sales: 0, 
      purchases: 0,
      expenses: 0,
      salesGst: 0, 
      purchasesGst: 0,
      salesWithoutGst: 0,
      purchasesWithoutGst: 0
    };
    existing.sales += Number(bill.grand_total);
    existing.salesGst += Number(bill.total_cgst || 0) + Number(bill.total_sgst || 0) + Number(bill.total_igst || 0);
    existing.salesWithoutGst += Number(bill.subtotal);
    dataMap.set(period, existing);
  });

  (pos || []).forEach((po) => {
    const period = getMonthKey(po.po_date);
    const existing = dataMap.get(period) || { 
      sales: 0, 
      purchases: 0,
      expenses: 0,
      salesGst: 0, 
      purchasesGst: 0,
      salesWithoutGst: 0,
      purchasesWithoutGst: 0
    };
    existing.purchases += Number(po.grand_total);
    existing.purchasesGst += Number(po.total_cgst || 0) + Number(po.total_sgst || 0) + Number(po.total_igst || 0);
    existing.purchasesWithoutGst += Number(po.subtotal);
    dataMap.set(period, existing);
  });

  (expenses || []).forEach((expense) => {
    const period = getMonthKey(expense.expense_date);
    const existing = dataMap.get(period) || { 
      sales: 0, 
      purchases: 0,
      expenses: 0,
      salesGst: 0, 
      purchasesGst: 0,
      salesWithoutGst: 0,
      purchasesWithoutGst: 0
    };
    existing.expenses += Number(expense.amount);
    dataMap.set(period, existing);
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

// ============ Cash Memo APIs ============
export async function getMyCashMemos(): Promise<CashMemo[]> {
  const { data, error } = await supabase
    .from('cash_memos')
    .select('*')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createCashMemo(memoData: CashMemoForm): Promise<CashMemo> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('cash_memos')
    .insert({ user_id: userId, ...memoData })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCashMemo(memoId: string, memoData: CashMemoForm): Promise<CashMemo> {
  const { data, error } = await supabase
    .from('cash_memos')
    .update({ ...memoData, updated_at: new Date().toISOString() })
    .eq('id', memoId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCashMemo(memoId: string): Promise<void> {
  const { error } = await supabase.from('cash_memos').delete().eq('id', memoId);
  if (error) throw error;
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

export async function updateChallan(challanId: string, challanData: DeliveryChallanForm): Promise<DeliveryChallan> {
  const { items, ...challanInfo } = challanData;
  const { data: challan, error: challanError } = await supabase
    .from('delivery_challans')
    .update({ ...challanInfo, updated_at: new Date().toISOString() })
    .eq('id', challanId)
    .select()
    .single();

  if (challanError) throw challanError;

  const { error: deleteItemsError } = await supabase
    .from('delivery_challan_items')
    .delete()
    .eq('challan_id', challanId);

  if (deleteItemsError) throw deleteItemsError;

  if (items && items.length > 0) {
    const { error: itemsError } = await supabase
      .from('delivery_challan_items')
      .insert(items.map((item) => ({ challan_id: challanId, ...item })));

    if (itemsError) throw itemsError;
  }

  return challan;
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

