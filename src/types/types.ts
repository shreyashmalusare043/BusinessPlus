// Database types matching Supabase schema

export type UserRole = 'user' | 'admin';
export type PaymentStatus = 'pending' | 'paid' | 'unpaid';
export type PaymentReminder = 'none' | 'now' | '7_days' | '30_days' | '45_days' | '90_days';
export type WorkType = 'outsource' | 'inhouse';
export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PurchaseOrderClassification = 'expense' | 'stock';
export type GstType = 'cgst_sgst' | 'igst';
export type UnitType = string;
export type BillNotesFormat = 'paragraph' | 'bullet';

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  subscription_id: string | null;
  transaction_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number;
  customer_name: string | null;
  customer_address: string | null;
  customer_gstin: string | null;
  customer_state: string | null;
  customer_state_code: string | null;
  job_work_supplier: string | null;
  supplier_code: string | null;
  supplier_gstin: string | null;
  process_nature: string | null;
  process_quantity: number | null;
  process_rate: number | null;
  process_value: number | null;
  material_quantity: number | null;
  material_rate: number | null;
  material_value: number | null;
  gst_rate: number | null;
  expected_delivery_date: string | null;
  currency: string;
  payment_method: string | null;
  status: TransactionStatus;
  plan_type: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithUser extends Subscription {
  user: {
    username: string;
    email: string;
  };
}

export interface TransactionWithUser extends Transaction {
  user: {
    username: string;
    email: string;
  };
}

export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  gst_number: string;
  address: string;
  contact_phone: string | null;
  contact_email: string | null;
  logo_url: string | null;
  signature_url: string | null;
  stamp_url: string | null;
  website: string | null;
  bank_name: string | null;
  account_holder_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  branch_name: string | null;
  bill_template: 'blue' | 'orange' | 'gray' | 'purple';
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  bill_no: string;
  bill_date: string;
  customer_name: string;
  customer_address: string | null;
  customer_gst_number: string | null;
  customer_email: string | null;
  po_number: string | null;
  delivery_challan_no: string | null;
  delivery_challan_date: string | null;
  gst_type: GstType;
  subtotal: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  tcs_applicable: boolean;
  tcs_amount: number;
  grand_total: number;
  notes: string | null;
  notes_format: BillNotesFormat;
  payment_status: PaymentStatus;
  payment_reminder: PaymentReminder;
  last_reminder_sent_at: string | null;
  payment_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillItem {
  id: string;
  bill_id: string;
  item_name: string;
  hsn_code: string | null;
  quantity: number;
  unit: UnitType;  
  unit_price: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  line_total: number;
  created_at: string;
}

export interface BillWithItems extends Bill {
  bill_items: BillItem[];
}

export interface PurchaseOrder {
  id: string;
  user_id: string;
  po_no: string;
  invoice_no: string | null;
  po_date: string;
  supplier_name: string;
  supplier_contact: string | null;
  supplier_address: string | null;
  supplier_gst_number: string | null;
  gst_type: GstType;
  classification: PurchaseOrderClassification;
  status: 'pending' | 'confirmed' | 'revised';
  payment_status: 'paid' | 'unpaid';
  payment_confirmed_at: string | null;
  subtotal: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  item_name: string;
  hsn_code: string | null;
  quantity: number;
  unit_price: number;
  cgst_rate: number;
  sgst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  line_total: number;
  created_at: string;
}

export interface PurchaseOrderWithItems extends PurchaseOrder {
  purchase_order_items: PurchaseOrderItem[];
}

export interface StockItem {
  id: string;
  user_id: string;
  item_name: string;
  hsn_code: string | null;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export type MaterialMovementType = 'in' | 'out';
export type MaterialMovementSource = 'manual' | 'challan' | 'bill' | 'purchase_order';

export interface MaterialInventoryMovement {
  id: string;
  user_id: string;
  movement_type: MaterialMovementType;
  movement_date: string;
  item_name: string;
  hsn_code: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  party_name: string | null;
  document_number: string | null;
  purchase_order_number: string | null;
  party_gstin: string | null;
  party_address: string | null;
  document_date: string | null;
  order_number: string | null;
  order_id: string | null;
  purchase_order_date: string | null;
  vehicle_number: string | null;
  transporter_name: string | null;
  eway_bill_number: string | null;
  item_description: string | null;
  product_id: string | null;
  batch_number: string | null;
  drawing_number: string | null;
  drawing_revision: string | null;
  amount: number;
  document_type: string | null;
  document_id: string | null;
  source: MaterialMovementSource;
  inventory_status: 'completed' | 'pending' | 'in_process' | 'rejected';
  inventory_remark: string | null;
  source_inward_id: string | null;
  related_bill_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface MaterialInventoryMovementForm {
  movement_type: MaterialMovementType;
  movement_date: string;
  item_name: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  party_name: string;
  document_number: string;
  purchase_order_number: string;
  party_gstin?: string;
  party_address?: string;
  document_date?: string;
  order_number?: string;
  order_id?: string;
  purchase_order_date?: string;
  vehicle_number?: string;
  transporter_name?: string;
  eway_bill_number?: string;
  eway_bill_date?: string;
  item_description?: string;
  product_id?: string;
  batch_number?: string;
  drawing_number?: string;
  drawing_revision?: string;
  amount?: number;
  needs_verification?: string[];
  customer_name?: string;
  customer_address?: string;
  customer_gstin?: string;
  customer_state?: string;
  customer_state_code?: string;
  job_work_supplier?: string;
  supplier_code?: string;
  supplier_gstin?: string;
  process_nature?: string;
  process_quantity?: number;
  process_rate?: number;
  process_value?: number;
  material_quantity?: number;
  material_rate?: number;
  material_value?: number;
  gst_rate?: number;
  expected_delivery_date?: string;
  document_type: string;
  notes: string;
  inventory_status?: 'completed' | 'pending' | 'in_process' | 'rejected';
  inventory_remark?: string;
  source_inward_id?: string;
  related_bill_id?: string;
}

export type InwardStatus = 'draft' | 'processing' | 'verification_required' | 'received' | 'in_process' | 'ready_for_outward' | 'partially_outward' | 'completed' | 'cancelled';

export interface InwardItemForm {
  product_name: string;
  product_code: string;
  description: string;
  hsn_sac: string;
  gst_rate: number | null;
  nature_of_process: string;
  process_qty: number | null;
  process_unit: string;
  process_rate: number | null;
  process_value: number | null;
  material_qty: number;
  material_unit: string;
  material_rate: number | null;
  material_value: number | null;
  drawing_no: string;
  drawing_revision_no: string;
  expected_delivery_date: string;
  remarks: string;
}

export interface InwardEntryForm {
  challan_no: string;
  challan_date: string;
  document_no: string;
  document_date: string;
  customer_name: string;
  customer_gstin: string;
  customer_address: string;
  customer_state: string;
  customer_state_code: string;
  vehicle_no: string;
  transporter: string;
  eway_bill_no: string;
  eway_bill_date: string;
  supplier_name: string;
  supplier_code: string;
  supplier_gstin: string;
  po_no: string;
  po_date: string;
  order_no: string;
  order_id: string;
  job_order_no: string;
  job_order_item_no: string;
  received_date: string;
  items: InwardItemForm[];
}

export interface InwardEntry extends InwardEntryForm {
  id: string;
  user_id: string;
  inward_no: string;
  status: InwardStatus;
  original_document_url: string | null;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface AvailableInwardItem {
  id: string;
  inward_id: string;
  inward_no: string;
  customer_name: string;
  product_name: string | null;
  description: string;
  hsn_sac: string | null;
  material_qty: number;
  material_unit: string;
  material_rate: number;
  outward_qty: number;
  available_qty: number;
}

// Form types for creating/editing
export interface BillItemForm {
  item_name: string;
  hsn_code: string;
  quantity: number;
  unit: UnitType;   
  unit_price: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
}

export interface BillForm {
  customer_name: string;
  customer_address: string;
  customer_gst_number: string;
  customer_email?: string;
  bill_date: string;
  po_number?: string;
  delivery_challan_no?: string;
  delivery_challan_date?: string;
  gst_type: GstType;
  tcs_applicable: boolean;
  notes?: string;
  notes_format: BillNotesFormat;
  payment_status?: PaymentStatus;
  payment_reminder?: PaymentReminder;
  items: BillItemForm[];
}

export interface PurchaseOrderItemForm {
  item_name: string;
  hsn_code: string;
  quantity: number;
  unit_price: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
}

export interface PurchaseOrderForm {
  supplier_name: string;
  supplier_contact: string;
  supplier_address: string;
  supplier_gst_number: string;
  invoice_no: string;
  po_date: string;
  payment_status: 'paid' | 'unpaid';
  status?: 'pending' | 'confirmed' | 'revised';
  classification: PurchaseOrderClassification;
  gst_type: 'cgst_sgst' | 'igst';
  items: PurchaseOrderItemForm[];
}

export interface StockItemForm {
  item_name: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
}

export interface CompanyForm {
  company_name: string;
  gst_number: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name: string;
  logo_url: string | null;
  signature_url: string | null;
  stamp_url: string | null;
}

// GST API response
export interface GSTDetails {
  legal_name: string;
  trade_name: string;
  address: string;
  status: string;
}

// Dashboard stats
export interface DashboardStats {
  total_bills: number;
  total_purchase_orders: number;
  total_stock_items: number;
  low_stock_items: number;
}

// Report data
export interface ReportData {
  period: string;
  total_sales: number;
  total_purchases: number;
  total_expenses: number;
  sales_gst: number;
  purchases_gst: number;
  sales_without_gst: number;
  purchases_without_gst: number;
}

export type ReportType = 'daily' | 'weekly' | 'yearly' | 'custom';

// Work tracking types
export interface WorkLog {
  id: string;
  user_id: string;
  log_date: string;
  work_type: WorkType;
  company_name: string;
  machine_hours: number;
  jobs_completed: number;
  notes: string | null;
  work_order_id: string | null;
  setup_number: number | null;
  quantity_completed: number;
  created_at: string;
  updated_at: string;
}

export interface WorkLogForm {
  log_date: string;
  work_type: WorkType;
  company_name: string;
  machine_hours: number;
  jobs_completed: number;
  notes: string;
  work_order_id: string;
  setup_number: number | null;
  quantity_completed: number;
}

export interface Customer {
  id: string;
  user_id: string;
  company_name: string;
  gst_number: string | null;
  address: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  user_id: string;
  company_name: string;
  gst_number: string | null;
  address: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export type DeliveryChallanPurpose = 'job_work' | 'return_after_job_work' | 'repair' | 'sample' | 'branch_transfer' | 'sales';

export interface DeliveryChallan {
  id: string;
  user_id: string;
  challan_no: string;
  challan_date: string;
  place_of_supply: string;
  party_name: string;
  party_address: string | null;
  party_gst: string | null;
  party_state: string | null;
  vehicle_number: string | null;
  purpose: DeliveryChallanPurpose;
  created_at: string;
  updated_at: string;
}

export interface DeliveryChallanItem {
  id: string;
  challan_id: string;
  item_name: string;
  description: string | null;
  hsn_code: string | null;
  quantity: number;
  unit: string;
  created_at: string;
}

export interface DeliveryChallanWithItems extends DeliveryChallan {
  challan_items: DeliveryChallanItem[];
}

export interface DeliveryChallanForm {
  challan_date: string;
  place_of_supply: string;
  party_name: string;
  party_address: string;
  party_gst: string;
  party_state: string;
  vehicle_number: string;
  purpose: DeliveryChallanPurpose;
  items: DeliveryChallanItemForm[];
}

export interface DeliveryChallanItemForm {
  item_name: string;
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
}

export interface WorkSummary {
  total_outsource_hours: number;
  total_inhouse_hours: number;
  total_jobs: number;
  total_logs: number;
}

export interface Expense {
  id: string;
  user_id: string;
  expense_name: string;
  category: string;
  amount: number;
  expense_date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseForm {
  expense_name: string;
  category: string;
  amount: number;
  expense_date: string;
  description: string;
}

export type CashMemoType = 'cash_in' | 'cash_out';
export type CashInPurpose = 'Payment' | 'Scrap' | 'Advance' | 'Other';
export type CashOutPurpose = 'Expense' | 'Investment' | 'Advance' | 'Other';

export interface CashMemo {
  id: string;
  user_id: string;
  transaction_type: CashMemoType;
  transaction_date: string;
  person_company_name: string;
  purpose: string;
  amount: number;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashMemoForm {
  transaction_type: CashMemoType;
  transaction_date: string;
  person_company_name: string;
  purpose: string;
  amount: number;
  remark: string;
}

export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface WorkOrder {
  id: string;
  user_id: string;
  work_order_number: string;
  company_name: string;
  customer_id: string | null;
  job_name: string | null;
  rate_per_piece: number;
  total_value: number;
  quantity_ordered: number;
  quantity_returned: number;
  setup_count: number;
  setup_completed: number;
  outstanding_quantity: number;
  work_start_date: string;
  completion_date: string | null;
  status: WorkOrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderWithDetails extends WorkOrder {
  customer?: Customer;
  work_logs?: WorkLog[];
  work_logs_count?: number;
  completed_tasks?: number;
  total_pictures?: number;
  remaining_tasks?: number;
  quantity_completed?: number;
  quantity_pending?: number;
}

export interface WorkOrderForm {
  company_name: string;
  customer_id: string;
  job_name: string;
  rate_per_piece: number;
  total_value: number;
  quantity_ordered: number;
  quantity_returned: number;
  setup_count?: number;
  setup_completed?: number;
  work_start_date: string;
  completion_date: string;
  status: WorkOrderStatus;
  notes: string;
}
