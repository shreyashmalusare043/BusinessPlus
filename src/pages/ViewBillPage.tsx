import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getBillById, getMyCompany, checkSubscriptionStatus } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Watermark } from '@/components/ui/watermark';
import { useAuth } from '@/contexts/AuthContext';
import type { BillWithItems, Company } from '@/types';

// Bill Copy Component - Minimalist Corporate Style
const BillCopy = ({ bill, company, copyType }: { bill: BillWithItems; company: Company; copyType: string }) => (
  <div className="bill-copy bg-white border border-gray-300 p-5">
    {/* Header Section */}
    <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-300">
      {/* Company Info */}
      <div className="flex gap-3 items-start">
        {company.logo_url && (
          <img src={company.logo_url} alt="Logo" className="h-16 w-16 object-contain flex-shrink-0" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{company.company_name}</h1>
          <div className="text-xs text-gray-600 space-y-0.5">
            <p>{company.address}</p>
            <p>Phone: {company.contact_phone || 'N/A'} | Email: {company.contact_email || 'N/A'}</p>
            {company.website && <p>Website: {company.website}</p>}
            <p className="font-semibold text-gray-800">GSTIN: {company.gst_number}</p>
          </div>
        </div>
      </div>

      {/* Invoice Title & Copy Type */}
      <div className="text-right">
        <h2 className="text-3xl font-bold text-primary mb-2">INVOICE</h2>
        <span className="inline-block bg-gray-900 text-white text-xs font-semibold px-3 py-1 uppercase tracking-wide">
          {copyType}
        </span>
      </div>
    </div>

    {/* Bill Info Section */}
    <div className="grid grid-cols-2 gap-8 mb-8">
      {/* Bill To */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</p>
        <p className="text-lg font-bold text-gray-900 mb-2">{bill.customer_name}</p>
        {bill.customer_address && (
          <p className="text-sm text-gray-600 mb-1">{bill.customer_address}</p>
        )}
        {bill.customer_gst_number && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold">GST No:</span> {bill.customer_gst_number}
          </p>
        )}
      </div>

      {/* Invoice Details */}
      <div className="text-right">
        <div className="space-y-1">
          <div className="flex justify-end gap-4">
            <span className="text-sm font-semibold text-gray-500">Invoice No:</span>
            <span className="text-sm font-bold text-gray-900">{bill.bill_no}</span>
          </div>
          <div className="flex justify-end gap-4">
            <span className="text-sm font-semibold text-gray-500">Invoice Date:</span>
            <span className="text-sm font-bold text-gray-900">{new Date(bill.bill_date).toLocaleDateString()}</span>
          </div>
          {bill.po_number && (
            <div className="flex justify-end gap-4">
              <span className="text-sm font-semibold text-gray-500">P.O. No:</span>
              <span className="text-sm font-bold text-gray-900">{bill.po_number}</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-8">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-3 px-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wide w-12">#</th>
            <th className="py-3 px-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">Description</th>
            <th className="py-3 px-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wide w-24">HSN/SAC</th>
            <th className="py-3 px-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wide w-16">Qty</th>
            <th className="py-3 px-2 text-right text-xs font-bold text-gray-900 uppercase tracking-wide w-24">Rate</th>
            <th className="py-3 px-2 text-right text-xs font-bold text-gray-900 uppercase tracking-wide w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.bill_items.map((item: any, index: number) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-3 px-2 text-sm text-gray-600">{index + 1}</td>
              <td className="py-3 px-2 text-sm font-medium text-gray-900">{item.item_name}</td>
              <td className="py-3 px-2 text-sm text-center text-gray-600">{item.hsn_code}</td>
              <td className="py-3 px-2 text-sm text-center text-gray-600">{item.quantity}</td>
              <td className="py-3 px-2 text-sm text-right text-gray-600">₹{item.unit_price.toFixed(2)}</td>
              <td className="py-3 px-2 text-sm text-right font-semibold text-gray-900">₹{item.line_total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Summary Section */}
    <div className="flex justify-end mb-8">
      <div className="w-80">
        <div className="space-y-2">
          <div className="flex justify-between py-2 text-sm border-b border-gray-200">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">₹{bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm border-b border-gray-200">
            <span className="text-gray-600">CGST (9%)</span>
            <span className="font-medium text-gray-900">₹{bill.total_cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm border-b border-gray-200">
            <span className="text-gray-600">SGST (9%)</span>
            <span className="font-medium text-gray-900">₹{bill.total_sgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 bg-primary text-primary-foreground px-4 mt-2">
            <span className="font-bold text-base">Total Amount</span>
            <span className="font-bold text-xl">₹{bill.grand_total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Bank Details & Footer */}
    <div className="border-t-2 border-gray-200 pt-6">
      <div className="grid grid-cols-2 gap-8">
        {/* Bank Details */}
        <div>
          {(company.bank_name || company.account_number) && (
            <>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Bank Details</p>
              <div className="text-xs text-gray-600 space-y-1">
                {company.bank_name && (
                  <p><span className="font-semibold text-gray-700">Bank:</span> {company.bank_name}</p>
                )}
                {company.account_holder_name && (
                  <p><span className="font-semibold text-gray-700">Account Holder:</span> {company.account_holder_name}</p>
                )}
                {company.account_number && (
                  <p><span className="font-semibold text-gray-700">Account No:</span> {company.account_number}</p>
                )}
                {company.ifsc_code && (
                  <p><span className="font-semibold text-gray-700">IFSC:</span> {company.ifsc_code}</p>
                )}
                {company.branch_name && (
                  <p><span className="font-semibold text-gray-700">Branch:</span> {company.branch_name}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Signature */}
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-600 mb-16">For {company.company_name}</p>
          <div className="inline-block border-t-2 border-gray-900 pt-2 px-8">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>

    {/* Thank You Note */}
    <div className="text-center mt-8 pt-6 border-t border-gray-200">
      <p className="text-sm font-semibold text-gray-600">Thank you for your business!</p>
    </div>
  </div>
);

export default function ViewBillPage() {
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<BillWithItems | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWatermark, setShowWatermark] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadBill();
      checkWatermark();
    }
  }, [id]);

  const checkWatermark = async () => {
    // Admin never sees watermark
    if (profile?.role === 'admin') {
      setShowWatermark(false);
      return;
    }

    // Check if user has premium subscription
    const hasPremium = await checkSubscriptionStatus();
    setShowWatermark(!hasPremium);
  };

  const loadBill = async () => {
    try {
      const [billData, companyData] = await Promise.all([getBillById(id!), getMyCompany()]);
      setBill(billData);
      setCompany(companyData);
    } catch (error) {
      console.error('Failed to load bill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${bill?.bill_no || 'Bill'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5cm;
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
    `,
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32 bg-muted" />
        <div className="bg-white p-8 rounded-lg">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!bill || !company) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Bill not found</p>
        <Button onClick={() => navigate('/bills')} className="mt-4">
          Back to Bills
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons - Not printed */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => navigate('/bills')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bills
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Bill
        </Button>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="bg-white w-full max-w-[210mm] mx-auto border border-gray-200 rounded-lg overflow-hidden">
        <style>
          {`
            @media print {
              .bill-copy {
                page-break-after: always;
                page-break-inside: avoid;
                margin: 0;
                border: none !important;
                box-sizing: border-box;
              }
              .bill-copy:last-child {
                page-break-after: auto;
              }
              @page {
                size: A4;
                margin: 0.5cm;
              }
            }
            @media screen {
              .screen-content { max-width: 210mm; }
              .bill-copy {
                margin-bottom: 2rem;
              }
              .bill-copy:last-child {
                margin-bottom: 0;
              }
            }
          `}
        </style>
        <div className="screen-content">
          {/* Original Copy */}
          <BillCopy bill={bill} company={company} copyType="ORIGINAL" />
          
          {/* Duplicate Copy */}
          <BillCopy bill={bill} company={company} copyType="DUPLICATE" />
          
          {/* Triplicate Copy */}
          <BillCopy bill={bill} company={company} copyType="TRIPLICATE" />
          
          {/* Watermark - Only show for free users */}
          {showWatermark && <Watermark type="bill" />}
        </div>
      </div>
    </div>
  );
}
