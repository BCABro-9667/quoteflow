
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Printer, Edit } from "lucide-react";
// import { useToast } from "@/hooks/use-toast"; // Uncomment if you plan to use toast here

interface QuotationViewActionsProps {
  quotationId: string;
  quotationNumber: string;
}

export function QuotationViewActions({ quotationId, quotationNumber }: QuotationViewActionsProps) {
  // const { toast } = useToast(); // Uncomment if you plan to use toast here

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Placeholder for actual PDF generation/download logic
    console.log(`Downloading quotation ${quotationNumber} PDF...`);
    // toast({ title: "Download Started", description: `Quotation ${quotationNumber} PDF is being prepared.` });
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
