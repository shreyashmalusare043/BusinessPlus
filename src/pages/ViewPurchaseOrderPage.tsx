import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPurchaseOrderById, getMyCompany, checkSubscriptionStatus } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Watermark } from '@/components/ui/watermark';
import { useAuth } from '@/contexts/AuthContext';
import type { PurchaseOrderWithItems, Company } from '@/types';
import html2pdf from 'html2pdf.js';

export default function ViewPurchaseOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [po, setPO] = useState<PurchaseOrderWithItems | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWatermark, setShowWatermark] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadPO();
      checkWatermark();
    }
  }, [id]);

  const checkWatermark = async () => {
    if (profile?.role === 'admin') {
      setShowWatermark(false);
      return;
    }
    const hasPremium = await checkSubscriptionStatus();
    setShowWatermark(!hasPremium);
  };

  const loadPO = async () => {
    try {
      const [poData, companyData] = await Promise.all([getPurchaseOrderById(id!), getMyCompany()]);
      setPO(poData);
      setCompany(companyData);
    } catch (error) {
      console.error('Failed to load purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleDownloadPDF = async () => {
    if (!printRef.current || !po) {
      console.error('PDF Generation Error: Missing printRef or po data');
      alert('Unable to generate PDF. Please try again.');
      return;
    }

    try {
      const element = printRef.current;
      const poDate = new Date(po.po_date).toISOString().split('T')[0];
      const filename = `PO_${po.po_no}_${poDate}.pdf`;

      console.log('Starting PDF generation for:', filename);

      // Temporarily remove mobile scaling for PDF generation
      const poContainer = element.querySelector('.print-container');
      console.log('Found PO container:', !!poContainer);
      
      let originalStyles = {transform: '', width: '', margin: '', minWidth: ''};
      
      if (poContainer) {
        const htmlContainer = poContainer as HTMLElement;
        originalStyles = {
          transform: htmlContainer.style.transform,
          width: htmlContainer.style.width,
          margin: htmlContainer.style.marginBottom,
          minWidth: htmlContainer.style.minWidth
        };
        
        // Remove all scaling and force full size
        htmlContainer.style.transform = 'none';
        htmlContainer.style.width = '210mm';
        htmlContainer.style.minWidth = '210mm';
        htmlContainer.style.marginBottom = '0';
      }

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
      await html2pdf().set(opt).from(element).save();
      console.log('PDF generated successfully');

      // Restore mobile scaling
      if (poContainer) {
        const htmlContainer = poContainer as HTMLElement;
        htmlContainer.style.transform = originalStyles.transform;
        htmlContainer.style.width = originalStyles.width;
        htmlContainer.style.marginBottom = originalStyles.margin;
        htmlContainer.style.minWidth = originalStyles.minWidth;
      }
      
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
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Purchase order not found</p>
        <Button onClick={() => navigate('/purchase-orders')}>Back to Purchase Orders</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => navigate('/purchase-orders')} className="w-full sm:w-auto justify-start sm:justify-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Purchase Orders
        </Button>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDownloadPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Print / Download
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div ref={printRef} className="p-4 md:p-8 bg-white text-black po-preview-container print-container">
            <style>
              {`
                /* Mobile preview scaling - show complete A4 page */
                @media screen and (max-width: 767px) {
                  .po-preview-container {
                    overflow: hidden;
                    width: 100%;
                  }
                  
                  .print-container {
                    transform-origin: top left;
                    transform: scale(0.35);
                    width: 210mm !important;
                    min-width: 210mm !important;
                    margin-bottom: -500px !important;
                    padding: 32px !important;
                  }
                  
                  /* Force desktop layout - override all responsive classes */
                  .print-container * {
                    max-width: none !important;
                  }
                  
                  .print-container > div:first-child {
                    flex-direction: row !important;
                    align-items: flex-start !important;
                    justify-content: space-between !important;
                  }
                  
                  /* Force Purchase Order title to right side */
                  .print-container > div:first-child > div:last-child {
                    text-align: right !important;
                    width: auto !important;
                  }
                  
                  .print-container h1 {
                    font-size: 1.5rem !important;
                  }
                  
                  .print-container h2 {
                    font-size: 1.875rem !important;
                  }
                  
                  .print-container img {
                    height: 4rem !important;
                  }
                  
                  .print-container .grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                  }
                  
                  .print-container table {
                    width: 100% !important;
                    font-size: 0.875rem !important;
                  }
                }
                
                @media print {
                  body { margin: 0; padding: 0; }
                  @page { margin: 0.5cm; size: A4; }
                  
                  /* Restore desktop layout for print */
                  .print-container {
                    padding: 40px !important;
                    transform: none !important;
                  }
                  .print-container > div:first-child {
                    flex-direction: row !important;
                    margin-bottom: 1.5rem !important;
                  }
                  .print-container h1 {
                    font-size: 1.5rem !important;
                  }
                  .print-container h2 {
                    font-size: 1.875rem !important;
                  }
                  .print-container img {
                    height: 4rem !important;
                  }
                  .print-container table {
                    min-width: 100% !important;
                  }
                }
              `}
            </style>
            {/* Header with Logo */}
            <div className="flex flex-col md:flex-row items-start justify-between mb-4 md:mb-6 pb-4 border-b-2 border-black gap-4">
              <div className="flex-1">
                {company?.logo_url && (
                  <img src={company.logo_url} alt="Company Logo" className="h-12 md:h-16 mb-2 object-contain" />
                )}
                <h1 className="text-xl md:text-2xl font-bold">{company?.company_name}</h1>
                <p className="text-xs md:text-sm mt-1">{company?.address}</p>
                <p className="text-xs md:text-sm">GST: {company?.gst_number}</p>
                {company?.contact_phone && <p className="text-xs md:text-sm">Phone: {company.contact_phone}</p>}
                {company?.contact_email && <p className="text-xs md:text-sm break-words">Email: {company.contact_email}</p>}
              </div>
              <div className="md:text-right w-full md:w-auto">
                <h2 className="text-2xl md:text-3xl font-bold">PURCHASE ORDER</h2>
                <p className="text-sm mt-2">
                  <strong>PO No:</strong> {po.po_no}
                </p>
                {po.invoice_no && (
                  <p className="text-sm">
                    <strong>Invoice No:</strong> {po.invoice_no}
                  </p>
                )}
                <p className="text-sm">
                  <strong>Date:</strong> {new Date(po.po_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Supplier Details */}
            <div className="mb-6">
              <h3 className="font-bold mb-2">Supplier:</h3>
              <p className="font-medium">{po.supplier_name}</p>
              {po.supplier_address && <p className="text-sm">{po.supplier_address}</p>}
              {po.supplier_contact && <p className="text-sm">Contact: {po.supplier_contact}</p>}
              {po.supplier_gst_number && <p className="text-sm">GST: {po.supplier_gst_number}</p>}
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0 mb-4 md:mb-6">
              <table className="w-full border-collapse" style={{ minWidth: '600px' }}>
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-2 px-2 border border-black min-w-[120px]">Item Name</th>
                    <th className="text-left py-2 px-2 border border-black min-w-[80px]">HSN</th>
                    <th className="text-right py-2 px-2 border border-black min-w-[60px]">Qty</th>
                    <th className="text-right py-2 px-2 border border-black min-w-[80px]">Rate</th>
                    <th className="text-right py-2 px-2 border border-black min-w-[80px]">CGST</th>
                    <th className="text-right py-2 px-2 border border-black min-w-[80px]">SGST</th>
                    <th className="text-right py-2 px-2 border border-black min-w-[90px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {po.purchase_order_items.map((item, index) => (
                    <tr key={index} className="border-b border-black">
                      <td className="py-2 px-2 border border-black">{item.item_name}</td>
                      <td className="py-2 px-2 border border-black">{item.hsn_code || '-'}</td>
                      <td className="text-right py-2 px-2 border border-black">{item.quantity}</td>
                      <td className="text-right py-2 px-2 border border-black">₹{item.unit_price.toFixed(2)}</td>
                      <td className="text-right py-2 px-2 border border-black">
                        {item.cgst_rate}%<br />₹{item.cgst_amount.toFixed(2)}
                      </td>
                      <td className="text-right py-2 px-2 border border-black">
                        {item.sgst_rate}%<br />₹{item.sgst_amount.toFixed(2)}
                      </td>
                      <td className="text-right py-2 px-2 border border-black font-medium">
                        ₹{item.line_total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-1 border-b">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹{po.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Total CGST:</span>
                  <span className="font-medium">₹{po.total_cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Total SGST:</span>
                  <span className="font-medium">₹{po.total_sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold border-t-2 border-black">
                  <span>Grand Total:</span>
                  <span>₹{po.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t text-center text-sm">
              <p>Thank you for your service!</p>
              <p className="mt-2 text-xs text-gray-600">
                This is a computer-generated purchase order and does not require a signature.
              </p>
            </div>
            
            {/* Watermark - Only show for free users */}
            {showWatermark && <Watermark type="purchase" />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
