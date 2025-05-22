import { getQuotationById, getCompanyById } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Edit } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

function getStatusBadgeVariant(status: Quotation['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'accepted': return 'default';
    case 'sent': return 'secondary';
    case 'draft': return 'outline';
    case 'rejected': return 'destructive';
    case 'archived': return 'secondary';
    default: return 'outline';
  }
}


export default async function ViewQuotationPage({ params }: { params: { id: string } }) {
  const quotation = await getQuotationById(params.id);

  if (!quotation) {
    notFound();
  }

  const company = await getCompanyById(quotation.companyId);

  const subTotal = quotation.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxRate = 0.18; // Example tax rate
  const taxAmount = subTotal * taxRate;
  const grandTotal = subTotal + taxAmount;

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-primary">Quotation #{quotation.quotationNumber}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
           <Button variant="outline" onClick={() => console.log("Downloading PDF...")}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button asChild>
            <Link href={`/quotations/${quotation.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-4xl mx-auto shadow-2xl print:shadow-none print:border-none">
        <CardHeader className="bg-muted/30 p-6 print:bg-transparent">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <Image src="https://placehold.co/150x50.png?text=QuoteFlow" alt="QuoteFlow Logo" width={150} height={50} className="mb-4" data-ai-hint="logo company" />
              <p className="text-sm text-muted-foreground">Your Company Name</p>
              <p className="text-sm text-muted-foreground">123 Main Street, Anytown, USA</p>
              <p className="text-sm text-muted-foreground">contact@yourcompany.com</p>
            </div>
            <div className="text-left md:text-right mt-4 md:mt-0">
              <h2 className="text-2xl font-semibold text-primary">QUOTATION</h2>
              <p className="text-sm"><strong>Number:</strong> {quotation.quotationNumber}</p>
              <p className="text-sm"><strong>Date:</strong> {format(new Date(quotation.date), "MMMM dd, yyyy")}</p>
              {quotation.validUntil && (
                <p className="text-sm"><strong>Valid Until:</strong> {format(new Date(quotation.validUntil), "MMMM dd, yyyy")}</p>
              )}
               <Badge variant={getStatusBadgeVariant(quotation.status)} className="capitalize mt-1 text-xs">
                Status: {quotation.status}
              </Badge>
            </div>
          </div>
          <Separator className="my-6" />
          {company && (
            <div className="mt-4">
              <h3 className="font-semibold text-muted-foreground mb-1">BILLED TO:</h3>
              <p className="font-medium text-lg">{company.name}</p>
              <p className="text-sm text-muted-foreground">{company.address}</p>
              <p className="text-sm text-muted-foreground">{company.contactPerson} ({company.contactEmail})</p>
              {company.gstin && <p className="text-sm text-muted-foreground">GSTIN: {company.gstin}</p>}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 print:bg-slate-100">
                <tr>
                  <th className="p-3 text-left font-semibold">#</th>
                  <th className="p-3 text-left font-semibold">Item (HSN/SAC)</th>
                  <th className="p-3 text-left font-semibold hidden md:table-cell">Description</th>
                  <th className="p-3 text-right font-semibold">Qty</th>
                  <th className="p-3 text-right font-semibold">Unit Price</th>
                  <th className="p-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item, index) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="p-3 align-top">{index + 1}</td>
                    <td className="p-3 align-top">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">HSN/SAC: {item.hsn}</div>
                       {item.imageUrl && <Image src={item.imageUrl} alt={item.name} width={50} height={50} className="mt-1 rounded object-cover print:hidden" data-ai-hint="product small" />}
                    </td>
                    <td className="p-3 align-top hidden md:table-cell">{item.description || '-'}</td>
                    <td className="p-3 align-top text-right">{item.quantity}</td>
                    <td className="p-3 align-top text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="p-3 align-top text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Separator className="my-6" />
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({taxRate * 100}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span className="text-primary">Grand Total:</span>
                <span className="text-primary">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {quotation.notes && (
            <>
              <Separator className="my-6" />
              <div>
                <h4 className="font-semibold mb-1">Notes / Terms & Conditions:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="p-6 bg-muted/30 print:bg-transparent">
          <p className="text-xs text-muted-foreground text-center w-full">
            Thank you for your business! If you have any questions, please contact us.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
