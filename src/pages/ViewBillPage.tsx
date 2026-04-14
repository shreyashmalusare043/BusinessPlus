import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getBillById, getMyCompany, checkSubscriptionStatus } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Watermark } from '@/components/ui/watermark';
import { useAuth } from '@/contexts/AuthContext';
import type { BillWithItems, Company } from '@/types';
import html2pdf from 'html2pdf.js';

// Bill Copy Component - Minimalist Corporate Style
const BillCopy = ({ bill, company, copyType }: { bill: BillWithItems; company: Company; copyType: string }) => (
  <div className="bill-copy bg-white" style={{ pageBreakAfter: 'always', pageBreakInside: 'avoid',breakInside: 'avoid' , marginBottom: '2rem', padding: '20px' }}>
    {/* Header Section */}
    <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 pb-4 md:pb-6 border-b-2 border-gray-200 gap-4">
      {/* Company Info */}
      <div className="flex gap-3 items-start">
        {company.logo_url && (
          <img src={company.logo_url} alt="Logo" className="h-16 md:h-20 w-16 md:w-20 object-contain flex-shrink-0" />
        )}
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{company.company_name}</h1>
          <div className="text-xs md:text-sm text-gray-600 space-y-0.5">
            <p>{company.address}</p>
            <p style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}> Phone: {company.contact_phone || 'N/A'} | Email: {company.contact_email || 'N/A'}
</p>
            {company.website && <p className="break-words">Website: {company.website}</p>}
            <p className="font-semibold text-gray-800 mt-1">GSTIN: {company.gst_number}</p>
          </div>
        </div>
      </div>

      {/* Invoice Title & Copy Type */}
      <div className="text-left md:text-right w-full md:w-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-primary mb-2">INVOICE</h2>
        <span 
  className="inline-block text-xs font-semibold px-3 py-1 uppercase tracking-wide"
  style={{
  backgroundColor: '#111827',
  color: '#ffffff',
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact'
}}
>
          {copyType}
        </span>
      </div>
    </div>

    {/* Bill Info Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
      {/* Bill To */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</p>
        <p className="text-base md:text-lg font-bold text-gray-900 mb-2">{bill.customer_name}</p>
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
      <div className="md:text-right">
        <div className="space-y-1">
          <div className="flex justify-between md:justify-end gap-4">
            <span className="text-sm font-semibold text-gray-500">Invoice No:</span>
            <span className="text-sm font-bold text-gray-900">{bill.bill_no}</span>
          </div>
          <div className="flex justify-between md:justify-end gap-4">
            <span className="text-sm font-semibold text-gray-500">Invoice Date:</span>
            <span className="text-sm font-bold text-gray-900">{new Date(bill.bill_date).toLocaleDateString()}</span>
          </div>
          {bill.po_number && (
            <div className="flex justify-between md:justify-end gap-4">
              <span className="text-sm font-semibold text-gray-500">P.O. No:</span>
              <span className="text-sm font-bold text-gray-900">{bill.po_number}</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-6 md:mb-8 overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0">
      <table className="w-full" style={{ minWidth: '100px' }}>
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-3 px-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wide w-12 min-w-[40px]">#</th>
            <th className="py-3 px-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wide min-w-[120px]">Description</th>
            <th className="py-3 px-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wide w-24 min-w-[80px]">HSN/SAC</th>
            <th className="py-3 px-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wide w-16 min-w-[60px]">Qty</th>
            <th className="py-3 px-2 text-right text-xs font-bold text-gray-900 uppercase tracking-wide w-24 min-w-[80px]">Rate</th>
            <th className="py-3 px-2 text-right text-xs font-bold text-gray-900 uppercase tracking-wide w-28 min-w-[90px]">Amount</th>
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
    <div className="flex justify-end mb-6 md:mb-8">
      <div className="w-full md:w-80">
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
          <div 
  className="flex justify-between py-3 px-4 mt-2"
  style={{
  backgroundColor: '#f97316',
  color: '#ffffff',
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact'
}}
>
            <span className="font-bold text-sm md:text-base">Total Amount</span>
            <span className="font-bold text-lg md:text-xl">₹{bill.grand_total.toFixed(2)}</span>
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
  });

  const handleDownloadPDF = async () => {
  if (!printRef.current || !bill) return;

  const element = printRef.current;

  const copies = element.querySelectorAll('.bill-copy');

  copies.forEach((copy: any) => {
    copy.style.transform = 'none';
    copy.style.width = '210mm';
    copy.style.minWidth = '210mm';
  });

  // 🔥 WAIT for DOM update (IMPORTANT)
  await new Promise((res) => setTimeout(res, 500));

    try {
      const element = printRef.current;
      const billDate = new Date(bill.bill_date).toISOString().split('T')[0];
      const filename = `Bill_${bill.bill_no}_${billDate}.pdf`;

      console.log('Starting PDF generation for:', filename);

      // Temporarily remove mobile scaling for PDF generation
      const billCopies = element.querySelectorAll('.bill-copy');
      console.log('Found bill copies:', billCopies.length);
      
      const originalStyles: Array<{transform: string; width: string; margin: string; minWidth: string}> = [];
      
      billCopies.forEach((copy, index) => {
        const htmlCopy = copy as HTMLElement;
        originalStyles[index] = {
          transform: htmlCopy.style.transform,
          width: htmlCopy.style.width,
          margin: htmlCopy.style.marginBottom,
          minWidth: htmlCopy.style.minWidth
        };
        
        // Remove all scaling and force full size
      
        htmlCopy.style.width = '210mm';
        htmlCopy.style.minWidth = '210mm';
        htmlCopy.style.maxWidth = '210mm';
        htmlCopy.style.boxSizing = 'border-box';
      });

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' as const
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      console.log('Generating PDF with options:', opt);

const firstCopy = element.querySelector('.bill-copy') as HTMLElement;

if (!firstCopy) {
  console.error('No bill copy found');
  return;
}

await html2pdf().set(opt).from(firstCopy).save();

console.log('PDF generated successfully');

      // Restore mobile scaling
      billCopies.forEach((copy, index) => {
        const htmlCopy = copy as HTMLElement;
        htmlCopy.style.transform = originalStyles[index].transform;
        htmlCopy.style.width = originalStyles[index].width;
        htmlCopy.style.marginBottom = originalStyles[index].margin;
        htmlCopy.style.minWidth = originalStyles[index].minWidth;
      });
      
      console.log('Mobile scaling restored');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please check the console for details.');
    }
  };

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
    <div className="space-y-6 px-4 md:px-0">
      {/* Action Buttons - Not printed */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 print:hidden">
        <Button variant="outline" onClick={() => navigate('/bills')} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bills
        </Button>
        <div className="flex flex-col sm:flex-row gap-2">
          
          <Button onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="h-4 w-4 mr-2" />
            Print Bill
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="bg-white p-2 md:p-4 bill-preview-container">
        <style>
          {`
            /* Mobile preview scaling - show complete A4 page */

            * {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

            @media screen and (max-width: 767px) {
              .bill-preview-container {
                overflow: hidden;
                width: 100%;
              }
              
              .bill-copy {
                transform-origin: top left;
                transform: scale(0.35);
                width: 230mm !important;
                min-width: 210mm !important;
                margin-bottom: 20px !important;
                padding: 20px !important;
              }
              
              /* Force desktop layout - override all responsive classes */
              .bill-copy * {
                max-width: none !important;
              }
              
              .bill-copy > div:first-child {
                flex-direction: row !important;
                align-items: flex-start !important;
                justify-content: space-between !important;
              }
              
              /* Force Invoice title to right side */
              .bill-copy > div:first-child > div:last-child {
                text-align: right !important;
                width: auto !important;
              }
              
              .bill-copy h1 {
                font-size: 1.875rem !important;
              }
              
              .bill-copy h2 {
                font-size: 2.25rem !important;
              }
              
              .bill-copy img {
                height: 5rem !important;
                width: 5rem !important;
              }
              
              .bill-copy .grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              
              .bill-copy table {
                width: 100% !important;
                font-size: 0.875rem !important;
              }
            }
            
            @media print {
  body * {
    visibility: hidden;
  }

  .bill-preview-container,
  .bill-preview-container *,
  .watermark {
    visibility: visible !important;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }

  .bill-preview-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .bill-copy {
    transform: none !important;
    width: 210mm !important;
    min-width: 210mm !important;
    margin: 0 auto !important;
    padding: 20px !important;
    background: white !important;
    page-break-after: always;
    box-shadow: none !important;
    border: none !important;
  }

  @page {
    size: A4 portrait;
    margin: 15mm;
  }
}
              
              /* Restore desktop layout for print */
              .bill-copy > div:first-child {
                flex-direction: row !important;
                margin-bottom: 2rem !important;
                padding-bottom: 1.5rem !important;
              }
              .bill-copy h1 {
                font-size: 1.875rem !important;
              }
              .bill-copy h2 {
                font-size: 2.25rem !important;
                text-align: right !important;
              }
              .bill-copy img {
                height: 5rem !important;
                width: 5rem !important;
              }
              .bill-copy .grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 2rem !important;
              }
              .bill-copy table {
                min-width: 100% !important;
              }
              /* Restore summary section width for print */
              .bill-copy > div:has(> div > .space-y-2) {
                justify-content: flex-end !important;
              }
              .bill-copy > div > div.w-full {
                width: 20rem !important;
              }
              /* Right align INVOICE heading and copy label for print */
              .bill-copy > div:first-child > div:last-child {
                text-align: right !important;
                width: auto !important;
              }
            }
          `}
        </style>
        
        <div ref={printRef} className="bg-white p-2 md:p-4 bill-preview-container">
  <BillCopy bill={bill} company={company} copyType="ORIGINAL" />
  <BillCopy bill={bill} company={company} copyType="DUPLICATE" />
  <BillCopy bill={bill} company={company} copyType="TRIPLICATE" />

  {showWatermark && <Watermark type="bill" />}
</div>
      </div>
    </div>
  );
}