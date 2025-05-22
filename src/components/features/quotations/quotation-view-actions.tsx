
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Printer, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    toast({ title: "Preparing PDF", description: `Your quotation ${quotationNumber} will be prepared for printing or saving as PDF.` });
    window.print(); // Triggers print dialog, user can "Save as PDF"
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
