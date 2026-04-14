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
    contentRef: printRef,
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

      // Get the inner div (the actual content)
      const contentDiv = element.querySelector('.po-preview-container > div') as HTMLElement;
      console.log('Found content div:', !!contentDiv);
      
      if (!contentDiv) {
        console.error('Content div not found');
        alert('Unable to generate PDF. Please try again.');
        return;
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
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const 
        }
      };

      console.log('Generating PDF with options:', opt);
      await html2pdf().set(opt).from(contentDiv).save();
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try printing instead.');
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
          <div ref={printRef} className="bg-white text-black po-preview-container">
            <style>
              {`
                /* Mobile preview scaling - show complete A4 page */
                @media screen and (max-width: 767px) {
                  .po-preview-container {
                    overflow: hidden;
                    width: 100%;
                  }
                  
                  .po-preview-container > div {
                    transform-origin: top left;
                    transform: scale(0.35);
                    width: 210mm !important;
                    min-width: 210mm !important;
                    margin-bottom: -500px !important;
                  }
                }
                
                /* Desktop view - normal A4 size */
                @media screen and (min-width: 768px) {
                  .po-preview-container {
                    padding: 2rem;
                  }
                  
                  .po-preview-container > div {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    padding: 32px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  }
                }
                
                @media print {
                  body { margin: 0; padding: 0; }
                  @page { margin: 0.5cm; size: A4; }
                  
                  .po-preview-container {
                    padding: 0 !important;
                  }
                  
                  .po-preview-container > div {
                    transform: none !important;
                    width: 100% !important;
                    min-width: 100% !important;
                    margin: 0 !important;
                    padding: 40px !important;
                    box-shadow: none !important;
                  }
                }
              `}
            </style>
            <div className="bg-white" style={{ padding: '32px' }}>
              {/* Header with Logo */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-black">
                <div className="flex-1">
                  {company?.logo_url && (
                    <img src={company.logo_url} alt="Company Logo" className="h-16 mb-2 object-contain" />
                  )}
                  <h1 className="text-2xl font-bold">{company?.company_name}</h1>
                  <p className="text-sm mt-1">{company?.address}</p>
                  <p className="text-sm">GST: {company?.gst_number}</p>
                  {company?.contact_phone && <p className="text-sm">Phone: {company.contact_phone}</p>}
                  {company?.contact_email && <p className="text-sm">Email: {company.contact_email}</p>}
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold">PURCHASE ORDER</h2>
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
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left py-2 px-2 border border-black">Item Name</th>
                      <th className="text-left py-2 px-2 border border-black">HSN</th>
                      <th className="text-right py-2 px-2 border border-black">Qty</th>
                      <th className="text-right py-2 px-2 border border-black">Rate</th>
                      <th className="text-right py-2 px-2 border border-black">CGST</th>
                      <th className="text-right py-2 px-2 border border-black">SGST</th>
                      <th className="text-right py-2 px-2 border border-black">Total</th>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
