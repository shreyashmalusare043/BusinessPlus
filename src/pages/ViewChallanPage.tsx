import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getChallanById } from '@/db/api';
import { getMyCompany } from '@/db/api';
import { checkSubscriptionStatus } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Watermark } from '@/components/ui/watermark';
import { useAuth } from '@/contexts/AuthContext';
import type { DeliveryChallanWithItems, Company } from '@/types';
import html2pdf from 'html2pdf.js';

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

// Challan Copy Component
const ChallanCopy = ({ challan, company, copyType }: { challan: DeliveryChallanWithItems; company: Company; copyType: string }) => (
  <div className="challan-copy bg-white p-4 md:p-8">
    {/* Header Section */}
    <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-8 pb-4 md:pb-6 border-b-2 border-gray-200 gap-4">
      {/* Company Info */}
      <div className="flex gap-3 items-start">
        {company.logo_url && (
          <img src={company.logo_url} alt="Logo" className="h-12 w-12 md:h-20 md:w-20 object-contain flex-shrink-0" />
        )}
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{company.company_name}</h1>
          <div className="text-xs md:text-sm text-gray-600 space-y-0.5">
            <p>{company.address}</p>
            <p>Phone: {company.contact_phone || 'N/A'} | Email: {company.contact_email || 'N/A'}</p>
            <p className="font-semibold text-gray-800 mt-1">GSTIN: {company.gst_number}</p>
          </div>
        </div>
      </div>

      {/* Challan Title & Copy Type */}
      <div className="text-left md:text-right w-full md:w-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-primary mb-2">DELIVERY CHALLAN</h2>
        <span className="inline-block bg-gray-900 text-white text-xs font-semibold px-3 py-1 uppercase tracking-wide">
          {copyType}
        </span>
      </div>
    </div>

    {/* Challan Info Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-4 md:mb-8">
      {/* Consignee Details */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Consignee / Party Details</p>
        <p className="text-lg font-bold text-gray-900 mb-2">{challan.party_name}</p>
        {challan.party_address && <p className="text-sm text-gray-600 mb-1">{challan.party_address}</p>}
        <div className="text-sm text-gray-600 mt-2 space-y-0.5">
          {challan.party_gst && <p><span className="font-semibold">GSTIN:</span> {challan.party_gst}</p>}
          {challan.party_state && <p><span className="font-semibold">State:</span> {challan.party_state}</p>}
        </div>
      </div>

      {/* Challan Details */}
<div className="flex justify-end w-full">
  <div className="text-right pr-5">
    <div className="space-y-1">
      
      <div className="flex justify-end gap-4">
        <span className="text-sm font-semibold text-gray-500">Challan No:</span>
        <span className="text-sm font-bold text-gray-900">{challan.challan_no}</span>
      </div>

      <div className="flex justify-end gap-4">
        <span className="text-sm font-semibold text-gray-500">Date:</span>
        <span className="text-sm font-bold text-gray-900">
          {new Date(challan.challan_date).toLocaleDateString()}
        </span>
      </div>

      <div className="flex justify-end gap-4">
        <span className="text-sm font-semibold text-gray-500">Place of Supply:</span>
        <span className="text-sm font-bold text-gray-900">{challan.place_of_supply}</span>
      </div>

      <div className="flex justify-end gap-4">
        <span className="text-sm font-semibold text-gray-500">Purpose:</span>
        <span className="text-sm font-bold text-primary">
          {purposeLabels[challan.purpose]}
        </span>
      </div>

    </div>
  </div>
</div>
</div>
    {/* Items Table */}
    <div className="mb-4 md:mb-8 overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0">
      <table className="w-full text-sm" style={{ minWidth: '500px' }}>
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-2 px-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wide w-10 min-w-[40px]">#</th>
            <th className="py-2 px-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wide min-w-[120px]">Item Name</th>
            <th className="py-2 px-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wide min-w-[120px]">Description</th>
            <th className="py-2 px-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wide w-20 min-w-[80px]">HSN/SAC</th>
            <th className="py-2 px-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wide w-16 min-w-[60px]">Qty</th>
            <th className="py-2 px-2 text-center text-xs font-bold text-gray-900 uppercase tracking-wide w-16 min-w-[60px]">Unit</th>
          </tr>
        </thead>
        <tbody>
          {challan.challan_items.map((item, index) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2 px-2 text-gray-600">{index + 1}</td>
              <td className="py-2 px-2 font-medium text-gray-900">{item.item_name}</td>
              <td className="py-2 px-2 text-gray-600">{item.description || '-'}</td>
              <td className="py-2 px-2 text-center text-gray-600">{item.hsn_code || '-'}</td>
              <td className="py-2 px-2 text-center text-gray-600">{item.quantity}</td>
              <td className="py-2 px-2 text-center text-gray-600">{item.unit}</td>
            </tr>
          ))}
          {/* Empty rows for spacing */}
          {challan.challan_items.length < 5 && Array.from({ length: 5 - challan.challan_items.length }).map((_, i) => (
            <tr key={`empty-${i}`} className="border-b border-gray-200">
              <td className="py-2 px-2 h-8">&nbsp;</td>
              <td className="py-2 px-2">&nbsp;</td>
              <td className="py-2 px-2">&nbsp;</td>
              <td className="py-2 px-2">&nbsp;</td>
              <td className="py-2 px-2">&nbsp;</td>
              <td className="py-2 px-2">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Declaration */}
    <div className="mb-8 p-3 bg-gray-50 border border-gray-200 rounded">
      <p className="text-xs font-bold text-gray-900 uppercase mb-1">Declaration:</p>
      <p className="text-sm text-gray-700">{purposeDeclarations[challan.purpose]}</p>
    </div>

    {/* Footer - Signature Section */}
    <div className="border-t-2 border-gray-200 pt-6">
      <div className="grid grid-cols-2 gap-12">
        {/* Prepared By */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-12">Prepared By</p>
          <div className="inline-block border-t-2 border-gray-900 pt-2 px-8">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Signature</p>
          </div>
        </div>

        {/* Authorized Signatory */}
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-600 mb-12">For {company.company_name}</p>
          <div className="inline-block border-t-2 border-gray-900 pt-2 px-8">
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

  const handleDownloadPDF = async () => {
    if (!printRef.current || !challan) {
      console.error('PDF Generation Error: Missing printRef or challan data');
      alert('Unable to generate PDF. Please try again.');
      return;
    }

    try {
      const element = printRef.current;
      const challanDate = new Date(challan.challan_date).toISOString().split('T')[0];
      const filename = `Challan_${challan.challan_no}_${challanDate}.pdf`;

      console.log('Starting PDF generation for:', filename);

      // Temporarily remove mobile scaling for PDF generation
      const challanCopies = element.querySelectorAll('.challan-copy');
      console.log('Found challan copies:', challanCopies.length);
      
      const originalStyles: Array<{transform: string; width: string; margin: string; minWidth: string}> = [];
      
      challanCopies.forEach((copy, index) => {
        const htmlCopy = copy as HTMLElement;
        originalStyles[index] = {
          transform: htmlCopy.style.transform,
          width: htmlCopy.style.width,
          margin: htmlCopy.style.marginBottom,
          minWidth: htmlCopy.style.minWidth
        };
        
        // Remove all scaling and force full size
        htmlCopy.style.transform = 'none';
        htmlCopy.style.width = '210mm';
        htmlCopy.style.minWidth = '210mm';
        htmlCopy.style.marginBottom = '2rem';
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
      await html2pdf().set(opt).from(element).save();
      console.log('PDF generated successfully');

      // Restore mobile scaling
      challanCopies.forEach((copy, index) => {
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
      <div className="space-y-6 px-4 md:px-0">
        <Skeleton className="h-9 w-32 bg-muted" />
        <div className="bg-white p-4 md:p-8 rounded-lg">
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
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground">Delivery Challan not found</p>
        <Button onClick={() => navigate('/delivery-challans')} className="mt-4 w-full sm:w-auto">
          Back to Delivery Challans
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-0">
      {/* Action Buttons - Not printed */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 print:hidden">
        <Button variant="outline" onClick={() => navigate('/delivery-challans')} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Delivery Challans
        </Button>
        <div className="flex flex-col sm:flex-row gap-2">
          
          <Button onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="h-4 w-4 mr-2" />
            Print Challan
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="bg-white p-2 md:p-4 challan-preview-container">
        <style>
          {`
            /* Mobile preview scaling - show complete A4 page */
            @media screen and (max-width: 767px) {
              .challan-preview-container {
                overflow: hidden;
                width: 100%;
              }
              
              .challan-copy {
                transform-origin: top left;
                transform: scale(0.35);
                width: 230mm !important;
                min-width: 230 !important;
                margin-bottom: -400px !important;
                padding: 20px !important;
              }
              
              /* Force desktop layout - override all responsive classes */
              .challan-copy * {
                max-width: none !important;
              }
              
              .challan-copy > div:first-child {
                flex-direction: row !important;
                align-items: flex-start !important;
                justify-content: space-between !important;
              }
              
              /* Force Delivery Challan title to right side */
              .challan-copy > div:first-child > div:last-child {
                text-align: right !important;
                width: auto !important;
              }
              
              .challan-copy h1 {
                font-size: 1.875rem !important;
              }
              
              .challan-copy h2 {
                font-size: 2.25rem !important;
              }
              
              .challan-copy img {
                height: 5rem !important;
                width: 5rem !important;
              }
              
              .challan-copy .grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              
              .challan-copy table {
                width: 100% !important;
                font-size: 0.875rem !important;
              }
            }
            
            @media print {
              /* Hide everything except the challan content */
              body * {
                visibility: hidden;
              }
              
              /* Show only the printable content */
              .challan-copy, .challan-copy * {
                visibility: visible;
              }
              
              /* Reset body and page */
              body { 
                margin: 0 !important; 
                padding: 0 !important;
                background: white !important;
              }
              
              /* Position challan copies at top left */
              .challan-preview-container {
  position: static !important;
}

.challan-copy {
  position: relative !important;
  width: 210mm !important;
  min-width: 210mm !important;
  margin: 0 auto !important;
  padding: 20px !important;
  page-break-after: always !important;
  transform: none !important;
  background: white !important;
}
              
              .challan-copy:last-child { 
                page-break-after: auto; 
              }
              
              @page { 
                margin: 0.5cm; 
                size: A4; 
              }
              
              /* Restore desktop layout for print */
              .challan-copy > div:first-child {
                flex-direction: row !important;
                margin-bottom: 2rem !important;
                padding-bottom: 1.5rem !important;
              }
              
              .challan-copy h1 {
                font-size: 1.875rem !important;
              }
              
              .challan-copy h2 {
                font-size: 2.25rem !important;
                text-align: right !important;
              }
              
              .challan-copy img {
                height: 5rem !important;
                width: 5rem !important;
              }
              
              .challan-copy .grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 2rem !important;
              }
              
              .challan-copy table {
                min-width: 100% !important;
              }
              
              /* Right align challan heading and copy label for print */
              .challan-copy > div:first-child > div:last-child {
                text-align: right !important;
                width: auto !important;
              }
              
              /* Right align challan details for print */
              .challan-copy > div:nth-child(2) > div:last-child {
                text-align: right !important;
              }
              
              .challan-copy > div:nth-child(2) > div:last-child .flex {
                justify-content: flex-end !important;
              }
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
