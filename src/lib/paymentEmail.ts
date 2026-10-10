import html2pdf from 'html2pdf.js';
import type { BillWithItems, Company } from '@/types';

const escapeHtml = (value: unknown): string => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export async function createBillPdfBase64(bill: BillWithItems, company: Company): Promise<string> {
  const element = document.createElement('div');
  element.style.width = '794px';
  element.style.padding = '28px';
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#111827';
  element.innerHTML = `
    <div style="font-family: Arial, sans-serif; font-size: 12px;">
      <div style="display:flex; justify-content:space-between; border-bottom:2px solid #e5e7eb; padding-bottom:18px; margin-bottom:22px;">
        <div>
          <h1 style="font-size:24px; margin:0 0 8px;">${escapeHtml(company.company_name)}</h1>
          <div>${escapeHtml(company.address)}</div>
          <div>${escapeHtml(company.contact_phone || '')} | ${escapeHtml(company.contact_email || '')}</div>
          <div style="font-weight:bold; margin-top:5px;">GSTIN: ${escapeHtml(company.gst_number)}</div>
        </div>
        <div style="text-align:right;"><h2 style="font-size:28px; margin:0; color:#f97316;">INVOICE</h2></div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:24px;">
        <div><div style="color:#6b7280; font-size:10px;">BILL TO</div><strong>${escapeHtml(bill.customer_name)}</strong><div>${escapeHtml(bill.customer_address || '')}</div><div>${escapeHtml(bill.customer_gst_number || '')}</div></div>
        <div style="text-align:right;"><div><strong>Invoice No:</strong> ${escapeHtml(bill.bill_no)}</div><div><strong>Date:</strong> ${escapeHtml(new Date(bill.bill_date).toLocaleDateString('en-GB'))}</div>${bill.po_number ? `<div><strong>P.O. No:</strong> ${escapeHtml(bill.po_number)}</div>` : ''}${bill.delivery_challan_no ? `<div><strong>Delivery Challan No:</strong> ${escapeHtml(bill.delivery_challan_no)}</div>` : ''}${bill.delivery_challan_date ? `<div><strong>Delivery Challan Date:</strong> ${escapeHtml(new Date(bill.delivery_challan_date).toLocaleDateString('en-GB'))}</div>` : ''}</div>
      </div>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
        <thead><tr style="border-bottom:2px solid #111827; text-align:left;"><th style="padding:8px 4px;">#</th><th style="padding:8px 4px;">Description</th><th style="padding:8px 4px;">HSN/SAC</th><th style="padding:8px 4px; text-align:right;">Qty</th><th style="padding:8px 4px; text-align:right;">Rate</th><th style="padding:8px 4px; text-align:right;">Amount</th></tr></thead>
        <tbody>${bill.bill_items.map((item, index) => `<tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 4px;">${index + 1}</td><td style="padding:8px 4px;">${escapeHtml(item.item_name)}</td><td style="padding:8px 4px;">${escapeHtml(item.hsn_code)}</td><td style="padding:8px 4px; text-align:right;">${Number(item.quantity).toFixed(3)} ${escapeHtml(item.unit)}</td><td style="padding:8px 4px; text-align:right;">₹${Number(item.unit_price).toFixed(2)}</td><td style="padding:8px 4px; text-align:right;">₹${(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}</td></tr>`).join('')}</tbody>
      </table>
      <div style="margin-left:auto; width:260px; border-top:1px solid #e5e7eb; padding-top:10px;">
        <div style="display:flex; justify-content:space-between;"><span>Subtotal</span><strong>₹${Number(bill.subtotal).toFixed(2)}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Tax</span><strong>₹${(Number(bill.total_cgst) + Number(bill.total_sgst) + Number(bill.total_igst)).toFixed(2)}</strong></div>
        <div style="display:flex; justify-content:space-between; background:#f97316; color:white; padding:10px; margin-top:8px;"><strong>Total Amount</strong><strong>₹${Number(bill.grand_total).toFixed(2)}</strong></div>
      </div>
      <div style="border-top:2px solid #e5e7eb; margin-top:30px; padding-top:16px; text-align:right;">For ${escapeHtml(company.company_name)}</div>
    </div>`;

  document.body.appendChild(element);
  try {
    const dataUri = await html2pdf().set({
      margin: 0,
      filename: `Bill_${bill.bill_no}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(element).outputPdf('datauristring');
    return dataUri.split(',')[1] || '';
  } finally {
    element.remove();
  }
}
