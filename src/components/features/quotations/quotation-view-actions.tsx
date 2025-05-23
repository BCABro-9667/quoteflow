
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Printer, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface QuotationViewActionsProps {
  quotationId: string;
  quotationNumber: string;
}

export function QuotationViewActions({ quotationId, quotationNumber }: QuotationViewActionsProps) {
  const { toast } = useToast(); 

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({ title: "Preparing PDF", description: `Generating PDF for quotation ${quotationNumber}...` });
    const input = document.getElementById('quotationCard');
    
    if (input) {
      // Temporarily remove print-specific hidden elements for capture if any and re-add later.
      // For this prototype, we assume screen capture is desired.
      // Ensure the background of the captured element is not transparent
      const originalBackgroundColor = input.style.backgroundColor;
      if (!originalBackgroundColor || originalBackgroundColor === 'transparent') {
         input.style.backgroundColor = 'var(--card)'; // Or any solid color defined in your CSS, e.g., white
      }

      html2canvas(input, { 
        scale: 2, // Improves resolution
        useCORS: true, // Important for external images like placeholders
        backgroundColor: null, // Use element's background
        onclone: (documentClone) => {
          // Ensure styles are fully applied in the cloned document if needed
          // e.g., for web fonts or specific CSS not caught by html2canvas
          // This is an advanced use case, for now, we assume direct styles are sufficient.
        }
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: 'p', // portrait
          unit: 'mm', // millimeters
          format: 'a4' // standard A4 size
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Calculate the aspect ratio
        const ratio = canvasWidth / canvasHeight;
        
        // Define margins (e.g., 10mm)
        const margin = 10;
        let imgWidthInPdf = pdfWidth - 2 * margin;
        let imgHeightInPdf = imgWidthInPdf / ratio;

        // If calculated height is too large for the page, scale by height instead
        if (imgHeightInPdf > (pdfHeight - 2 * margin)) {
            imgHeightInPdf = pdfHeight - 2 * margin;
            imgWidthInPdf = imgHeightInPdf * ratio;
        }
        
        // Center the image on the page (optional)
        const xPosition = (pdfWidth - imgWidthInPdf) / 2;
        const yPosition = (pdfHeight - imgHeightInPdf) / 2;

        pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidthInPdf, imgHeightInPdf);
        pdf.save(`quotation-${quotationNumber}.pdf`);
        
        toast({ title: "Download Started", description: `Quotation ${quotationNumber}.pdf is downloading.` });
      }).catch(err => {
        console.error("Error generating PDF:", err);
        toast({ title: "Error", description: "Could not generate PDF.", variant: "destructive" });
      }).finally(() => {
        // Restore original background if it was changed
        if (input) {
            input.style.backgroundColor = originalBackgroundColor;
        }
      });
    } else {
      toast({ title: "Error", description: "Could not find quotation content to download. Element #quotationCard not found.", variant: "destructive" });
    }
  };

  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" /> Print
      </Button>
      <Button variant="outline" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" /> Download PDF
      </Button>
      <Button asChild>
        <Link href={`/quotations/${quotationId}/edit`}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Link>
      </Button>
    </div>
  );
}
