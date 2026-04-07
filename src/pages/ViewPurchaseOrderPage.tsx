import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPurchaseOrderById, getMyCompany, checkSubscriptionStatus } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Watermark } from '@/components/ui/watermark';
import { useAuth } from '@/contexts/AuthContext';
import type { PurchaseOrderWithItems, Company } from '@/types';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/purchase-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Purchase Orders
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print / Download
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div ref={printRef} className="p-8 bg-white text-black">
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
            <table className="w-full mb-6 border-collapse">
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
