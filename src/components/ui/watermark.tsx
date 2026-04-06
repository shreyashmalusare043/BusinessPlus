interface WatermarkProps {
  type: 'bill' | 'purchase' | 'challan';
}

export function Watermark({ type }: WatermarkProps) {
  const documentType = type === 'bill' ? 'Bill' : type === 'purchase' ? 'Purchase' : 'Challan';
  
  return (
    <div className="watermark-container">
      <div className="watermark-text">
        <p className="text-lg font-bold">BusinessPlus Free Version</p>
        <p className="text-sm">{documentType} is created by BusinessPlus</p>
      </div>
      
      <style>{`
        .watermark-container {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          opacity: 0.3;
          pointer-events: none;
          z-index: 9999;
          color: #666;
        }
        
        @media print {
          .watermark-container {
            position: absolute;
            bottom: 15mm;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0.25;
            page-break-inside: avoid;
          }
          
          .watermark-text {
            font-family: Arial, sans-serif;
          }
        }
        
        @media screen {
          .watermark-container {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
