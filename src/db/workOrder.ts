import { supabase } from './supabase';
import type { WorkOrder, WorkOrderWithDetails, WorkOrderForm } from '@/types';

// Generate work order number
export async function generateWorkOrderNumber(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { count } = await supabase
    .from('work_orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const orderNumber = (count || 0) + 1;
  return `WO-${String(orderNumber).padStart(5, '0')}`;
}

// Get all work orders for the current user only
export async function getWorkOrders(): Promise<WorkOrder[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('work_orders_with_progress')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching work orders:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// Get work order by ID with details - only for current user
export async function getWorkOrderById(id: string): Promise<WorkOrderWithDetails | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Fetch work order with progress from view - only if it belongs to current user
  const { data: workOrder, error } = await supabase
    .from('work_orders_with_progress')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !workOrder) {
    console.error('Error fetching work order:', error);
    return null;
  }

  // Fetch customer details if customer_id exists
  let customer = null;
  if (workOrder.customer_id) {
    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('id', workOrder.customer_id)
      .maybeSingle();
    customer = customerData;
  }

  // Fetch linked work logs
  const { data: workLogs } = await supabase
    .from('work_logs')
    .select('*')
    .eq('work_order_id', id)
    .order('log_date', { ascending: false });

  // Calculate work log statistics
  const workLogsArray = Array.isArray(workLogs) ? workLogs : [];
  const completedTasks = workLogsArray.filter(log => log.work_type === 'inhouse').length;
  const totalPictures = 0;
  const remainingTasks = 0;

  return {
    ...workOrder,
    customer: customer || undefined,
    work_logs: workLogsArray,
    work_logs_count: workLogsArray.length,
    completed_tasks: completedTasks,
    total_pictures: totalPictures,
    remaining_tasks: remainingTasks,
  };
}

// Create work order
export async function createWorkOrder(workOrderData: WorkOrderForm): Promise<WorkOrder | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const workOrderNumber = await generateWorkOrderNumber();

  const { data, error } = await supabase
    .from('work_orders')
    .insert({
      user_id: user.id,
      work_order_number: workOrderNumber,
      company_name: workOrderData.company_name,
      customer_id: workOrderData.customer_id || null,
      job_name: workOrderData.job_name || null,
      rate_per_piece: workOrderData.rate_per_piece || 0,
      total_value: workOrderData.total_value,
      quantity_ordered: workOrderData.quantity_ordered,
      quantity_returned: workOrderData.quantity_returned || 0,
      work_start_date: workOrderData.work_start_date,
      completion_date: workOrderData.completion_date || null,
      status: workOrderData.status || 'pending',
      notes: workOrderData.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating work order:', error);
    return null;
  }

  return data;
}

// Update work order - only for current user
export async function updateWorkOrder(
  id: string,
  updates: Partial<WorkOrderForm>
): Promise<WorkOrder | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('work_orders')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating work order:', error);
    return null;
  }

  return data;
}

// Delete work order - only for current user
export async function deleteWorkOrder(id: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('work_orders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting work order:', error);
    return false;
  }

  return true;
}

// Get work orders by status - only for current user
export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('work_orders_with_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching work orders by status:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// Get work orders by customer - only for current user
export async function getWorkOrdersByCustomer(customerId: string): Promise<WorkOrder[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('work_orders_with_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching work orders by customer:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// Link work log to work order
export async function linkWorkLogToWorkOrder(
  workLogId: string,
  workOrderId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('work_logs')
    .update({ work_order_id: workOrderId })
    .eq('id', workLogId);

  if (error) {
    console.error('Error linking work log to work order:', error);
    return false;
  }

  return true;
}

// Unlink work log from work order
export async function unlinkWorkLogFromWorkOrder(workLogId: string): Promise<boolean> {
  const { error } = await supabase
    .from('work_logs')
    .update({ work_order_id: null })
    .eq('id', workLogId);

  if (error) {
    console.error('Error unlinking work log from work order:', error);
    return false;
  }

  return true;
}

// Get active work orders (pending or in_progress) for Work Track dropdown
export async function getActiveWorkOrders(): Promise<WorkOrder[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('work_orders_with_progress')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active work orders:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}
