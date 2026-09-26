import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Loader2, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCustomer, createMaterialInventoryMovement, deleteMaterialInventoryMovement, getMaterialInventoryMovements, getMyCustomers, updateMaterialInventoryMovement } from '@/db/api';
import type { Customer, MaterialInventoryMovement, MaterialInventoryMovementForm } from '@/types';

const emptyForm = (movementType: 'in' | 'out'): MaterialInventoryMovementForm => ({
  movement_type: movementType,
  movement_date: new Date().toISOString().slice(0, 10),
  item_name: '',
  hsn_code: '',
  quantity: 1,
  unit: 'pcs',
  unit_price: 0,
  party_name: '',
  document_number: '',
  purchase_order_number: '',
  document_type: '',
  party_gstin: '',
  party_address: '',
  document_date: '',
  order_number: '',
  order_id: '',
  purchase_order_date: '',
  vehicle_number: '',
  transporter_name: '',
  eway_bill_number: '',
  item_description: '',
  product_id: '',
  batch_number: '',
  drawing_number: '',
  drawing_revision: '',
  amount: 0,
  customer_name: '',
  customer_address: '',
  customer_gstin: '',
  customer_state: '',
  customer_state_code: '',
  job_work_supplier: '',
  supplier_code: '',
  supplier_gstin: '',
  process_nature: '',
  process_quantity: 0,
  process_rate: 0,
  process_value: 0,
  material_quantity: 0,
  material_rate: 0,
  material_value: 0,
  gst_rate: 18,
  expected_delivery_date: '',
  notes: '',
});

export const parseOcrText = (text: string, movementType: 'in' | 'out', ownCompanyName?: string): Partial<MaterialInventoryMovementForm> => {
  const datePattern = '(\\d{1,2}\\s*[/-]\\s*\\d{1,2}\\s*[/-]\\s*\\d{2,4}|\\d{4}\\s*[/-]\\s*\\d{1,2}\\s*[/-]\\s*\\d{1,2})';
  const dateMatch = text.match(new RegExp(`(?:date|dt\\.?)\\s*[:#-]?\\s*${datePattern}`, 'i')) || text.match(new RegExp(`\\b${datePattern}\\b`, 'i'));
  const quantityMatch = text.match(/(?:quantity|qty)\s*[:#-]?\s*([\d,.]+)\s*(nos?|pcs?|kg|ltr)?/i);
  const materialValueMatch = text.match(/material\s+value[\s\S]{0,120}?([\d,]+(?:\.\d+)?)\s*(?:$|\n)/i);
  const priceMatch = text.match(/material\s+rate[\s\S]{0,100}?([\d,]+(?:\.\d+)?)/i) || text.match(/(?:unit\s*)?(?:rate|price)\s*[:#-]?\s*₹?\s*([\d,.]+)/i);
  const documentMatch = text.match(/challan\s*no\.?\s*[:#-]?\s*([A-Z0-9][A-Z0-9/_.-]+)/i) || text.match(/(?:invoice|bill|p\.\s*o\.?|document)\s*(?:no|number|#)?\s*[:#-]\s*([A-Z0-9][A-Z0-9/_.-]+)/i);
  const poMatch = text.match(/labou?r\s*p\.?\s*o\.?\s*(?:no|number)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9/_.-]+)/i)
    || text.match(/(?:job\s*order|p\.?\s*o\.?)\s*(?:no|number)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9/_.-]+)/i);
  const itemCodeMatch = text.match(/\b(\d{3,}[A-Z0-9]*(?:-[A-Z0-9]+){2,})\b/i);
  const itemDescriptionMatch = itemCodeMatch && text.match(new RegExp(`${itemCodeMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+([^\\n|]+?)(?=\\s+\\d{8}\\s+|\\s+18%|\\s+HSN)`, 'i'));
  const partyMatch = text.match(/job\s*work\s*supplier\s*:\s*([A-Z][A-Z\s&.\-]+?)(?=\s+supplier\b|\s+code\b|\s*$)/i) || text.match(/supplier\s*:\s*([A-Z][A-Z\s&.\-]+)/i);
  const partyName = partyMatch?.[1]?.trim();
  const customerMatch = text.match(/(?:customer|consignor|from)\s*[:#-]?\s*([^\n|]+)/i);
  const headerCustomerMatch = text.match(/(?:^|\n)\s*([A-Z][A-Za-z ]{3,50})\s*[:\-]\s*(?:Outsource|Despatch)/i);
  const jobSupplierMatch = text.match(/job\s*work\s*supplier\s*[:#-]?\s*([^\n|]+)/i);
  const supplierCodeMatch = text.match(/(?:supplier\s*)?code\s*[:#-]?\s*([A-Z0-9-]+)/i);
  const stateMatch = text.match(/state\s*[:#-]?\s*([A-Za-z ]+?)(?=\s+state\s*code|\n|\||$)/i);
  const stateCodeMatch = text.match(/state\s*code\s*[:#-]?\s*(\d{2})/i);
  const gstRateMatch = text.match(/(?:gst|gst\s*rate)\s*(?:rate)?\s*[:#-]?\s*(\d+(?:\.\d+)?)\s*%/i);
  const processNatureMatch = text.match(/nature\s*of\s*process\s*[:#-]?\s*([^\n|]+)/i);
  const drawingMatch = text.match(/drawing\s*(?:no|number)?\s*[:#-]?\s*([A-Z0-9/-]+)/i);
  const expectedDateMatch = text.match(new RegExp(`(?:exp\\.?\\s*del\\.?\\s*date|expected\\s*delivery)\\s*[:#-]?\\s*${datePattern}`, 'i'));
  const normalizedOwnCompany = ownCompanyName?.replace(/\s+/g, ' ').trim().toLowerCase();
  const hsnMatch = text.match(/(?:hsn|hsn\/sac)\s*[:#-]?\s*([0-9]{4,8})/i) || text.match(/\b([0-9]{8})\b/);
  const gstMatch = text.match(/(?:gst(?:in)?|gst\s*no\.?)\s*[:#-]?\s*([0-9A-Z]{15})/i);
  const vehicleMatch = text.match(/(?:vehicle|truck|lorry)\s*(?:no|number)?\s*[:#-]?\s*([A-Z0-9-]+)/i);
  const transporterMatch = text.match(/transporter\s*[:#-]?\s*([^\n|]+)/i);
  const ewayMatch = text.match(/e[-\s]?way\s*(?:bill)?\s*(?:no|number)?\s*[:#-]?\s*([A-Z0-9-]+)/i);
  const orderMatch = text.match(/(?:order|job\s*order)\s*(?:no|number|id)?\s*[:#-]?\s*([A-Z0-9/-]+)/i);
  const processQtyMatch = text.match(/process\s*qty[^\d]{0,20}(\d+(?:\.\d+)?)/i);
  const processRateMatch = text.match(/process\s*rate[^\d]{0,20}(\d+(?:\.\d+)?)/i);
  const processValueMatch = text.match(/process\s*value[^\d]{0,20}([\d,]+(?:\.\d+)?)/i);
  const materialQtyMatch = text.match(/material\s*qty[^\d]{0,20}(\d+(?:\.\d+)?)/i);
  const materialRateMatch = text.match(/material\s*rate[^\d]{0,20}(\d+(?:\.\d+)?)/i);
  const normalizeDate = (value?: string) => {
    if (!value) return undefined;
    const parts = value.replace(/\s+/g, '/').split(/[/-]/).map(Number);
    if (parts.length !== 3) return undefined;
    if (parts[0] > 31) return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;
    return `${parts[2] < 100 ? 2000 + parts[2] : parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;
  };

  return {
    movement_type: movementType,
    movement_date: normalizeDate(dateMatch?.[1]),
    item_name: itemDescriptionMatch ? `${itemCodeMatch[1]} ${itemDescriptionMatch[1].trim()}` : itemCodeMatch?.[1],
    hsn_code: hsnMatch?.[1],
    quantity: quantityMatch ? Number(quantityMatch[1].replace(/,/g, '')) : undefined,
    unit_price: materialValueMatch && quantityMatch
      ? Number(materialValueMatch[1].replace(/,/g, '')) / Number(quantityMatch[1].replace(/,/g, ''))
      : priceMatch ? Number(priceMatch[1].replace(/,/g, ''))
      : undefined,
    unit: quantityMatch?.[2] || undefined,
    party_name: customerMatch?.[1]?.trim() || headerCustomerMatch?.[1]?.trim() || (partyName && (!normalizedOwnCompany || !partyName.toLowerCase().includes(normalizedOwnCompany)) ? partyName : undefined),
    customer_name: customerMatch?.[1]?.trim() || headerCustomerMatch?.[1]?.trim(),
    job_work_supplier: jobSupplierMatch?.[1]?.trim(),
    supplier_code: supplierCodeMatch?.[1],
    customer_state: stateMatch?.[1]?.trim(),
    customer_state_code: stateCodeMatch?.[1],
    gst_rate: gstRateMatch ? Number(gstRateMatch[1]) : undefined,
    process_nature: processNatureMatch?.[1]?.trim(),
    process_quantity: processQtyMatch ? Number(processQtyMatch[1]) : undefined,
    process_rate: processRateMatch ? Number(processRateMatch[1]) : undefined,
    process_value: processValueMatch ? Number(processValueMatch[1].replace(/,/g, '')) : undefined,
    material_quantity: materialQtyMatch ? Number(materialQtyMatch[1]) : undefined,
    material_rate: materialRateMatch ? Number(materialRateMatch[1]) : undefined,
    material_value: materialValueMatch ? Number(materialValueMatch[1].replace(/,/g, '')) : undefined,
    expected_delivery_date: normalizeDate(expectedDateMatch?.[1]),
    document_number: documentMatch?.[1],
    purchase_order_number: poMatch?.[1],
    party_gstin: gstMatch?.[1],
    vehicle_number: vehicleMatch?.[1],
    transporter_name: transporterMatch?.[1]?.trim(),
    eway_bill_number: ewayMatch?.[1],
    order_number: orderMatch?.[1],
    order_id: orderMatch?.[1],
    drawing_number: drawingMatch?.[1],
    amount: materialValueMatch ? Number(materialValueMatch[1].replace(/,/g, '')) : undefined,
    document_type: /challan/i.test(text) ? 'challan' : /invoice|bill/i.test(text) ? 'invoice' : movementType === 'in' ? 'purchase' : 'bill',
  };
};

export const mapStructuredExtraction = (value: any): Partial<MaterialInventoryMovementForm> => {
  const item = value?.items?.[0] || {};
  const customer = value?.party || value?.customer || {};
  const challan = value?.challan || {};
  const transport = value?.transport || {};
  const order = value?.order || {};
  const worker = value?.job_work_supplier || value?.job_worker || {};
  return {
    document_number: challan.challan_no || challan.document_no || undefined,
    movement_date: challan.date || challan.challan_date || undefined,
    document_date: challan.document_date || undefined,
    customer_name: customer.name || undefined,
    party_name: customer.name || undefined,
    party_gstin: customer.gstin || undefined,
    customer_gstin: customer.gstin || undefined,
    customer_address: customer.address || undefined,
    customer_state: customer.state || undefined,
    customer_state_code: customer.state_code || undefined,
    vehicle_number: transport.vehicle_no || undefined,
    transporter_name: transport.transporter || undefined,
    eway_bill_number: transport.eway_bill_no || undefined,
    eway_bill_date: transport.eway_bill_date || undefined,
    purchase_order_number: order.po_no || undefined,
    purchase_order_date: order.po_date || undefined,
    order_number: order.order_no || undefined,
    order_id: order.order_id || undefined,
    job_work_supplier: worker.name || undefined,
    supplier_code: worker.code || undefined,
    supplier_gstin: worker.gstin || undefined,
    item_name: item.item_name || item.product_name || item.description || undefined,
    product_id: item.product_code || undefined,
    item_description: item.description || undefined,
    hsn_code: item.hsn_sac || undefined,
    quantity: item.material_qty ?? item.process_qty ?? undefined,
    material_quantity: item.material_qty ?? undefined,
    process_quantity: item.process_qty ?? undefined,
    unit: item.material_unit || item.process_unit || undefined,
    unit_price: item.material_rate ?? undefined,
    material_rate: item.material_rate ?? undefined,
    material_value: item.material_value ?? undefined,
    process_nature: item.nature_of_process || undefined,
    process_rate: item.process_rate ?? undefined,
    process_value: item.process_value ?? undefined,
    gst_rate: item.gst_rate ?? undefined,
    drawing_number: item.drawing_no || undefined,
    drawing_revision: item.drawing_revision_no || undefined,
    expected_delivery_date: item.expected_delivery_date || undefined,
    amount: item.material_value ?? undefined,
    needs_verification: Array.isArray(value?.needs_verification) ? value.needs_verification : [],
  };
};

export const normalizeVerificationFields = (fields: unknown): string[] => {
  if (!Array.isArray(fields)) return [];
  const aliases: Record<string, string> = {
    date: 'movement_date',
    challan_date: 'movement_date',
    challan_no: 'document_number',
    customer: 'customer_name',
    vehicle_no: 'vehicle_number',
    transporter: 'transporter_name',
    eway_bill_no: 'eway_bill_number',
    po_no: 'purchase_order_number',
    hsn_code: 'hsn_code',
  };
  return fields.filter((field): field is string => typeof field === 'string').map((field) => aliases[field] || field);
};

export const preprocessImage = (file: File): Promise<Blob> => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    const scale = Math.min(2, 2200 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not prepare image for OCR'));
      return;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const gray = Math.min(255, Math.max(0, ((pixels.data[index] * 299) + (pixels.data[index + 1] * 587) + (pixels.data[index + 2] * 114)) / 1000));
      const contrast = gray < 160 ? gray * 0.8 : Math.min(255, gray * 1.12);
      pixels.data[index] = contrast;
      pixels.data[index + 1] = contrast;
      pixels.data[index + 2] = contrast;
    }
    context.putImageData(pixels, 0, 0);
    canvas.toBlob((blob) => {
      URL.revokeObjectURL(objectUrl);
      blob ? resolve(blob) : reject(new Error('Could not prepare image for OCR'));
    }, 'image/png');
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Could not open the selected image'));
  };
  image.src = objectUrl;
});

export const imageToDataUrl = (image: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image'));
  reader.onerror = () => reject(new Error('Could not read image'));
  reader.readAsDataURL(image);
});

void parseOcrText;
void mapStructuredExtraction;
void normalizeVerificationFields;
void preprocessImage;
void imageToDataUrl;

export default function MaterialInventoryPage() {
  const [activeTab, setActiveTab] = useState<'in' | 'out'>('in');
  const [form, setForm] = useState<MaterialInventoryMovementForm>(emptyForm('in'));
  const [movements, setMovements] = useState<MaterialInventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerGst, setNewCustomerGst] = useState('');
  const [editingMovementId, setEditingMovementId] = useState<string | null>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  const loadMovements = async () => {
    try {
      setMovements(await getMaterialInventoryMovements());
    } catch (error: any) {
      toast.error(error.message || 'Failed to load material movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
    getMyCustomers().then(setCustomers).catch(() => undefined);
  }, []);

  const switchTab = (value: string) => {
    const movementType = value as 'in' | 'out';
    setActiveTab(movementType);
    setForm(emptyForm(movementType));
    setEditingMovementId(null);
  };

  const handleEdit = (movement: MaterialInventoryMovement) => {
    setActiveTab(movement.movement_type);
    setEditingMovementId(movement.id);
    setForm({
      ...emptyForm(movement.movement_type),
      movement_type: movement.movement_type,
      movement_date: movement.movement_date,
      item_name: movement.item_name,
      hsn_code: movement.hsn_code || '',
      quantity: Number(movement.quantity),
      unit: movement.unit,
      unit_price: Number(movement.unit_price),
      party_name: movement.party_name || '',
      document_number: movement.document_number || '',
      purchase_order_number: movement.purchase_order_number || '',
      party_gstin: movement.party_gstin || '',
      party_address: movement.party_address || '',
      order_number: movement.order_number || '',
      order_id: movement.order_id || '',
      vehicle_number: movement.vehicle_number || '',
      transporter_name: movement.transporter_name || '',
      eway_bill_number: movement.eway_bill_number || '',
      item_description: movement.item_description || '',
      product_id: movement.product_id || '',
      amount: Number(movement.amount || movement.total_amount || 0),
      document_type: movement.document_type || '',
      notes: movement.notes || '',
      gst_rate: 18,
    });
    requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const cancelEdit = () => {
    setEditingMovementId(null);
    setForm(emptyForm(activeTab));
  };

  const handleDelete = async (movement: MaterialInventoryMovement) => {
    if (!window.confirm(`Delete ${movement.item_name} material entry?`)) return;
    try {
      await deleteMaterialInventoryMovement(movement.id);
      if (editingMovementId === movement.id) cancelEdit();
      await loadMovements();
      toast.success('Material movement deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete material movement');
    }
  };

  const updateField = <K extends keyof MaterialInventoryMovementForm>(field: K, value: MaterialInventoryMovementForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateMaterialField = (field: 'material_quantity' | 'material_rate', value: number) => {
    setForm((current) => {
      const materialQuantity = field === 'material_quantity' ? value : Number(current.material_quantity) || 0;
      const materialRate = field === 'material_rate' ? value : Number(current.material_rate) || 0;
      return {
        ...current,
        [field]: value,
        material_value: materialQuantity * materialRate,
      };
    });
  };

  const handleCustomerSelect = (value: string) => {
    if (value === '__new__') {
      setShowNewCustomer(true);
      return;
    }
    const customer = customers.find((item) => item.id === value);
    if (!customer) return;
    setShowNewCustomer(false);
    setForm((current) => ({
      ...current,
      party_name: customer.company_name,
      party_gstin: customer.gst_number || '',
      party_address: customer.address || '',
      customer_name: customer.company_name,
      customer_gstin: customer.gst_number || '',
      customer_address: customer.address || '',
    }));
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) {
      toast.error('Company name is required');
      return;
    }
    try {
      const customer = await createCustomer({
        company_name: newCustomerName.trim(),
        gst_number: newCustomerGst.trim() || null,
        address: null,
        contact_person: null,
        contact_phone: null,
        contact_email: null,
      });
      setCustomers((current) => [...current, customer].sort((a, b) => a.company_name.localeCompare(b.company_name)));
      setNewCustomerName('');
      setNewCustomerGst('');
      setShowNewCustomer(false);
      handleCustomerSelect(customer.id);
      toast.success('Company added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add company');
    }
  };

  const materialValue = Math.max(0, Number(form.material_quantity) || 0) * Math.max(0, Number(form.material_rate) || 0);
  const taxableAmount = materialValue > 0
    ? materialValue
    : Math.max(0, Number(form.quantity) || 0) * Math.max(0, Number(form.unit_price) || 0);
  const gstAmount = taxableAmount * (Math.max(0, Number(form.gst_rate) || 0) / 100);
  const calculatedTotal = taxableAmount + gstAmount;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.item_name.trim() || form.quantity <= 0) {
      toast.error('Item name and a valid quantity are required');
      return;
    }
    setSaving(true);
    try {
      if (editingMovementId) {
        await updateMaterialInventoryMovement(editingMovementId, { ...form, amount: calculatedTotal, material_value: materialValue });
        toast.success('Material movement updated');
      } else {
        await createMaterialInventoryMovement({ ...form, amount: calculatedTotal, material_value: materialValue });
        toast.success(activeTab === 'in' ? 'Material Order In recorded' : 'Material Order Out recorded');
      }
      setEditingMovementId(null);
      setForm(emptyForm(activeTab));
      await loadMovements();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save material movement');
    } finally {
      setSaving(false);
    }
  };

  const visibleMovements = movements.filter((movement) => movement.movement_type === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Material Inventory</h1>
        <p className="text-muted-foreground mt-1">Track material received and issued with manual or document-assisted entry.</p>
      </div>

      <Tabs value={activeTab} onValueChange={switchTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="in"><ArrowDownToLine className="mr-2 h-4 w-4" />Order In</TabsTrigger>
          <TabsTrigger value="out"><ArrowUpFromLine className="mr-2 h-4 w-4" />Order Out</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <Card ref={formCardRef}>
            <CardHeader>
              <CardTitle>{activeTab === 'in' ? 'Receive Material' : 'Issue Material'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => { cancelEdit(); setShowNewCustomer(false); }}>
                    <RefreshCw className="mr-2 h-4 w-4" />Clear
                  </Button>
                  {editingMovementId && <Button type="button" variant="outline" onClick={cancelEdit}><X className="mr-2 h-4 w-4" />Cancel Edit</Button>}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.movement_date} onChange={(event) => updateField('movement_date', event.target.value)} /></div>
                  <div className="space-y-2"><Label>Document No.</Label><Input value={form.document_number} onChange={(event) => updateField('document_number', event.target.value)} placeholder="Challan / Bill / PO no." /></div>
                  <div className={activeTab === 'in' ? 'space-y-2' : 'hidden'}><Label>P.O. No.</Label><Input value={form.purchase_order_number} onChange={(event) => updateField('purchase_order_number', event.target.value)} placeholder="Enter purchase order number" /></div>
                  <div className="hidden"><Label>Document Type</Label><Input value={form.document_type} onChange={(event) => updateField('document_type', event.target.value)} placeholder="Challan, invoice, purchase" /></div>
                  <div className="space-y-2"><Label>Party / Company</Label><Select value={customers.find((customer) => customer.company_name === form.party_name)?.id || ''} onValueChange={handleCustomerSelect}><SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger><SelectContent>{customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.company_name}</SelectItem>)}<SelectItem value="__new__">+ Add new company</SelectItem></SelectContent></Select></div>
                  <div className="hidden"><Label>Party GSTIN</Label><Input value={form.party_gstin} onChange={(event) => updateField('party_gstin', event.target.value)} /></div>
                  <div className="hidden"><Label>Party Address</Label><Input value={form.party_address} onChange={(event) => updateField('party_address', event.target.value)} /></div>
                  <div className="hidden"><Label>Customer</Label><Input value={form.customer_name} readOnly /></div>
                  <div className="hidden"><Label>Job Work Supplier</Label><Input value={form.job_work_supplier} onChange={(event) => updateField('job_work_supplier', event.target.value)} /></div>
                  <div className="hidden"><Label>Supplier Code</Label><Input value={form.supplier_code} onChange={(event) => updateField('supplier_code', event.target.value)} /></div>
                  <div className="space-y-2"><Label>GST Rate %</Label><Input type="number" min="0" step="0.01" value={form.gst_rate} onChange={(event) => updateField('gst_rate', Number(event.target.value))} /></div>
                  <div className="space-y-2"><Label>Order Item / ID</Label><Input value={form.order_id} onChange={(event) => updateField('order_id', event.target.value)} placeholder="Enter order item or ID" /></div>
                  <div className="hidden"><Label>Vehicle No.</Label><Input value={form.vehicle_number} onChange={(event) => updateField('vehicle_number', event.target.value)} /></div>
                  <div className="hidden"><Label>Transporter</Label><Input value={form.transporter_name} onChange={(event) => updateField('transporter_name', event.target.value)} /></div>
                  <div className="hidden"><Label>E-Way Bill No.</Label><Input value={form.eway_bill_number} onChange={(event) => updateField('eway_bill_number', event.target.value)} /></div>
                  <div className="space-y-2"><Label>Item Name *</Label><Input value={form.item_name} onChange={(event) => updateField('item_name', event.target.value)} required /></div>
                  <div className="hidden"><Label>Product ID</Label><Input value={form.product_id} onChange={(event) => updateField('product_id', event.target.value)} /></div>
                  <div className="hidden"><Label>Description</Label><Input value={form.item_description} onChange={(event) => updateField('item_description', event.target.value)} /></div>
                  <div className="space-y-2"><Label>HSN Code</Label><Input value={form.hsn_code} onChange={(event) => updateField('hsn_code', event.target.value)} /></div>
                  <div className="space-y-2"><Label>Quantity *</Label><Input type="number" min="0.001" step="0.001" value={form.quantity} onChange={(event) => updateField('quantity', Number(event.target.value))} required /></div>
                  <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(event) => updateField('unit', event.target.value)} /></div>
                  <div className="space-y-2"><Label>Unit Price</Label><Input type="number" min="0" step="0.01" value={form.unit_price} onChange={(event) => updateField('unit_price', Number(event.target.value))} /></div>
                  <div className="hidden"><Label>Material Qty</Label><Input type="number" min="0" step="0.001" value={form.material_quantity} onChange={(event) => updateMaterialField('material_quantity', Number(event.target.value))} /></div>
                  <div className="hidden"><Label>Material Rate</Label><Input type="number" min="0" step="0.01" value={form.material_rate} onChange={(event) => updateMaterialField('material_rate', Number(event.target.value))} /></div>
                  <div className="hidden"><Label>Material Value</Label><Input type="number" value={form.material_value} readOnly /></div>
                  <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(event) => updateField('notes', event.target.value)} /></div>
                </div>
                {showNewCustomer && <div className="grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-3">
                  <div className="space-y-2"><Label>New Company Name</Label><Input value={newCustomerName} onChange={(event) => setNewCustomerName(event.target.value)} placeholder="Company name" /></div>
                  <div className="space-y-2"><Label>GSTIN</Label><Input value={newCustomerGst} onChange={(event) => setNewCustomerGst(event.target.value)} placeholder="Optional GSTIN" /></div>
                  <div className="flex items-end"><Button type="button" variant="secondary" onClick={handleAddCustomer}>Add Company</Button></div>
                </div>}
                <div className="grid grid-cols-1 gap-3 rounded-md border p-4 md:grid-cols-3">
                  <div><p className="text-xs text-muted-foreground">Taxable Amount</p><p className="text-lg font-semibold">₹{taxableAmount.toFixed(2)}</p></div>
                  <div><p className="text-xs text-muted-foreground">GST ({form.gst_rate}%)</p><p className="text-lg font-semibold">₹{gstAmount.toFixed(2)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total Amount</p><p className="text-lg font-semibold">₹{calculatedTotal.toFixed(2)}</p></div>
                </div>
                <Button type="submit" disabled={saving}>{editingMovementId ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{saving ? 'Saving...' : editingMovementId ? 'Update Material' : `Save Order ${activeTab === 'in' ? 'In' : 'Out'}`}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{activeTab === 'in' ? 'Order In History' : 'Order Out History'}</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : visibleMovements.length === 0 ? <p className="text-sm text-muted-foreground">No entries yet.</p> : (
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Item</TableHead><TableHead>Party</TableHead><TableHead>Challan / Document</TableHead><TableHead>PO No.</TableHead><TableHead className="text-right">Quantity</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Source</TableHead><TableHead>Action</TableHead></TableRow></TableHeader><TableBody>
                  {visibleMovements.map((movement) => <TableRow key={movement.id}><TableCell>{new Date(movement.movement_date).toLocaleDateString()}</TableCell><TableCell className="font-medium">{movement.item_name}</TableCell><TableCell>{movement.party_name || '-'}</TableCell><TableCell>{movement.document_number || '-'}</TableCell><TableCell>{movement.purchase_order_number || '-'}</TableCell><TableCell className="text-right">{movement.quantity} {movement.unit}</TableCell><TableCell className="text-right">₹{Number(movement.total_amount || 0).toFixed(2)}</TableCell><TableCell>{movement.source}</TableCell><TableCell><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" onClick={() => handleEdit(movement)} aria-label={`Edit ${movement.item_name}`}><Pencil className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" onClick={() => handleDelete(movement)} aria-label={`Delete ${movement.item_name}`} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>)}
                </TableBody></Table></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
