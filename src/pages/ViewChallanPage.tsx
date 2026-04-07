import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getChallanById } from '@/db/api';
import { getMyCompany } from '@/db/api';
import { checkSubscriptionStatus } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Watermark } from '@/components/ui/watermark';
import { useAuth } from '@/contexts/AuthContext';
import type { DeliveryChallanWithItems, Company } from '@/types';

const purposeLabels: Record<string, string> = {
  job_work: 'Job Work',
  return_after_job_work: 'Return after Job Work',
  repair: 'For Repair',
  sample: 'For Sample',
  branch_transfer: 'Branch Transfer',
};

const purposeDeclarations: Record<string, string> = {
  job_work: 'Goods sent for Job Work and not for sale.',
  return_after_job_work: 'Goods returned after Job Work and not for sale.',
  repair: 'Goods sent for Repair and not for sale.',
  sample: 'Goods sent as Sample and not for sale.',
  branch_transfer: 'Goods transferred to Branch and not for sale.',
};

// Challan Copy Component - Responsive
const ChallanCopy = ({ challan, company, copyType }: { challan: DeliveryChallanWithItems; company: Company; copyType: string }) => (
  <div className="challan-copy bg-white" style={{ pageBreakAfter: 'always', marginBottom: '2rem', padding: '20px md:40px' }}>
    {/* Header Section - Responsive */}
    <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b-2 border-gray-200 gap-4">
      {/* Company Info */}
      <div className="flex gap-2 md:gap-3 items-start flex-1">
        {company.logo_url && (
          <img src={company.logo_url} alt="Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{company.company_name}</h1>
          <div className="text-xs md:text-sm text-gray-600 space-y-0.5">
            <p className="break-words">{company.address}</p>
            <p className="break-words">Phone: {company.contact_phone || 'N/A'} | Email: {company.contact_email || 'N/A'}</p>
            <p className="font-semibold text-gray-800 mt-1">GSTIN: {company.gst_number}</p>
          </div>
        </div>
      </div>

      {/* Challan Title & Copy Type - Responsive */}
      <div className="text-right flex-shrink-0">
        <h2 className="text-2xl md:text-4xl font-bold text-primary mb-2">DELIVERY CHALLAN</h2>
        <span className="inline-block bg-gray-900 text-white text-xs font-semibold px-2 md:px-3 py-1 uppercase tracking-wide">
          {copyType}
        </span>
      </div>
    </div>

    {/* Challan Info Section - Responsive Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
      {/* Consignee Details */}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Consignee / Party Details</p>
        <p className="text-base md:text-lg font-bold text-gray-900 mb-2 break-words">{challan.party_name}</p>
        {challan.party_address && <p className="text-xs md:text-sm text-gray-600 mb-1 break-words">{challan.party_address}</p>}
        <div className="text-xs md:text-sm text-gray-600 mt-2 space-y-0.5">
          {challan.party_gst && <p className="break-words"><span className="font-semibold">GSTIN:</span> {challan.party_gst}</p>}
          {challan.party_state && <p className="break-words"><span className="font-semibold">State:</span> {challan.party_state}</p>}
        </div>
      </div>

      {/* Challan Details - Responsive */}
      <div className="text-left md:text-right">
        <div className="space-y-1">
          <div className="flex flex-col md:flex-row justify-start md:justify-end md:gap-4 gap-1">
            <span className="text-xs md:text-sm font-semibold text-gray-500">Challan No:</span>
            <span className="text-xs md:text-sm font-bold text-gray-900">{challan.challan_no}</span>
          </div>
          <div className="flex flex-col md:flex-row justify-start md:justify-end md:gap-4 gap-1">
            <span className="text-xs md:text-sm font-semibold text-gray-500">Date:</span>
            <span className="text-xs md:text-sm font-bold text-gray-900">{new Date(challan.challan_date).toLocaleDateString()}</span>
          </div>
          <div className="flex flex-col md:flex-row justify-start md:justify-end md:gap-4 gap-1 break-words">
            <span className="text-xs md:text-sm font-semibold text-gray-500">Place of Supply:</span>
            <span className="text-xs md:text-sm font-bold text-gray-900">{challan.place_of_supply}</span>
          </div>
          <div className="flex flex-col md:flex-row justify-start md:justify-end md:gap-4 gap-1">
            <span className="text-xs md:text-sm font-semibold text-gray-500">Purpose:</span>
            <span className="text-xs md:text-sm font-bold text-primary">{purposeLabels[challan.purpose]}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Items Table - Responsive */}
    <div className="mb-8 overflow-x-auto">
      <table className="w-full text-xs md:text-sm">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-2 md:py-2 px-1 md:px-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wide w-8 md:w-10">#</th>
            <th className="py-2 md:py-2 px-1 md:px-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">Item Name</th>
            <th className="py-2 md:py-2 px-1 md:px-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wide hidden md:table-cell">Description</th>
            <th className="py-2 md:py-2 px-1 md:px-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wide w-16 md:w-20">HSN/SAC</th>
            <th className="py-2 md:py-2 px-1 md:px-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wide w-12 md:w-16">Qty</th>
            <th className="py-2 md:py-2 px-1 md:px-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wide w-12 md:w-16">Unit</th>
          </tr>
        </thead>
        <tbody>
          {challan.challan_items.map((item, index) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2 md:py-2 px-1 md:px-2 text-gray-600">{index + 1}</td>
              <td className="py-2 md:py-2 px-1 md:px-2 font-medium text-gray-900 break-words">{item.item_name}</td>
              <td className="py-2 md:py-2 px-1 md:px-2 text-gray-600 hidden md:table-cell break-words">{item.description || '-'}</td>
              <td className="py-2 md:py-2 px-1 md:px-2 text-center text-gray-600">{item.hsn_code || '-'}</td>
              <td className="py-2 md:py-2 px-1 md:px-2 text-center text-gray-600">{item.quantity}</td>
              <td className="py-2 md:py-2 px-1 md:px-2 text-center text-gray-600">{item.unit}</td>
            </tr>
          ))}
          {/* Empty rows for spacing */}
          {challan.challan_items.length < 5 && Array.from({ length: 5 - challan.challan_items.length }).map((_, i) => (
            <tr key={`empty-${i}`} className="border-b border-gray-200">
              <td className="py-2 md:py-2 px-1 md:px-2 h-8">&nbsp;</td>
              <td className="py-2 md:py-2 px-1 md:px-2">&nbsp;</td>
              <td className="py-2 md:py-2 px-1 md:px-2 hidden md:table-cell">&nbsp;</td>
              <td className="py-2 md:py-2 px-1 md:px-2">&nbsp;</td>
              <td className="py-2 md:py-2 px-1 md:px-2">&nbsp;</td>
              <td className="py-2 md:py-2 px-1 md:px-2">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Declaration - Responsive */}
    <div className="mb-8 p-2 md:p-3 bg-gray-50 border border-gray-200 rounded">
      <p className="text-xs font-bold text-gray-900 uppercase mb-1">Declaration:</p>
      <p className="text-xs md:text-sm text-gray-700 break-words">{purposeDeclarations[challan.purpose]}</p>
    </div>

    {/* Footer - Signature Section - Responsive */}
    <div className="border-t-2 border-gray-200 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
        {/* Prepared By */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-8 md:mb-12">Prepared By</p>
          <div className="inline-block border-t-2 border-gray-900 pt-2 px-4 md:px-8">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Signature</p>
          </div>
        </div>

        {/* Authorized Signatory */}
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold text-gray-600 mb-8 md:mb-12">For {company.company_name}</p>
          <div className="inline-block border-t-2 border-gray-900 pt-2 px-4 md:px-8">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ViewChallanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challan, setChallan] = useState<DeliveryChallanWithItems | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWatermark, setShowWatermark] = useState(false);
  const { profile } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  useEffect(() => {
    if (id) {
      loadChallan();
      loadCompany();
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

  const loadChallan = async () => {
    try {
      const data = await getChallanById(id!);
      setChallan(data);
    } catch (error) {
      console.error('Failed to load delivery challan:', error);
      navigate('/delivery-challans');
    } finally {
      setLoading(false);
    }
  };

  const loadCompany = async () => {
    try {
      const data = await getMyCompany();
      setCompany(data);
    } catch (error) {
      console.error('Failed to load company:', error);
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

  if (!challan || !company) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Delivery Challan not found</p>
        <Button onClick={() => navigate('/delivery-challans')} className="mt-4">
          Back to Delivery Challans
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons - Not printed */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => navigate('/delivery-challans')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Delivery Challans
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Challan
        </Button>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="bg-white p-4">
        <style>
          {`
            @media print {
              body { margin: 0; padding: 0; }
              .challan-copy { page-break-after: always; }
              .challan-copy:last-child { page-break-after: auto; }
              @page { margin: 0.5cm; size: A4; }
            }
          `}
        </style>
        
        {/* Original Copy */}
        <ChallanCopy challan={challan} company={company} copyType="ORIGINAL" />
        
        {/* Duplicate Copy */}
        <ChallanCopy challan={challan} company={company} copyType="DUPLICATE" />
        
        {/* Triplicate Copy */}
        <ChallanCopy challan={challan} company={company} copyType="TRIPLICATE" />
        
        {/* Watermark - Only show for free users */}
        {showWatermark && <Watermark type="challan" />}
      </div>
    </div>
  );
}
