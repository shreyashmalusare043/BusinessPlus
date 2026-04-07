// Database types matching Supabase schema

export type UserRole = 'user' | 'admin';
export type PaymentStatus = 'pending' | 'paid' | 'unpaid';
export type PaymentReminder = 'none' | '7_days' | '30_days' | '45_days' | '90_days';
export type WorkType = 'outsource' | 'inhouse';
export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded';

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
  subtotal: number;
  total_cgst: number;
  total_sgst: number;
  grand_total: number;
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
  unit_price: number;
  cgst_rate: number;
  sgst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
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
  subtotal: number;
  total_cgst: number;
  total_sgst: number;
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

// Form types for creating/editing
export interface BillItemForm {
  item_name: string;
  hsn_code: string;
  quantity: number;
  unit_price: number;
  cgst_rate: number;
  sgst_rate: number;
}

export interface BillForm {
  customer_name: string;
  customer_address: string;
  customer_gst_number: string;
  customer_email?: string;
  bill_date: string;
  po_number?: string;
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
}

export interface PurchaseOrderForm {
  supplier_name: string;
  supplier_contact: string;
  supplier_address: string;
  supplier_gst_number: string;
  invoice_no: string;
  po_date: string;
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

export type DeliveryChallanPurpose = 'job_work' | 'return_after_job_work' | 'repair' | 'sample' | 'branch_transfer';

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
  work_start_date: string;
  completion_date: string;
  status: WorkOrderStatus;
  notes: string;
}

