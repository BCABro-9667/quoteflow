
import { getQuotationById, getCompanyById, getMyCompanySettings } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Quotation } from "@/types"; 
import { QuotationViewActions } from "@/components/features/quotations/quotation-view-actions";

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
  const myCompany = await getMyCompanySettings();

  if (!quotation) {
    notFound();
  }

  const clientCompany = await getCompanyById(quotation.companyId);

  // Totals section removed as per request

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-primary">Quotation #{quotation.quotationNumber}</h1>
        <QuotationViewActions quotationId={quotation.id} quotationNumber={quotation.quotationNumber} />
      </div>

      <Card id="quotationCard" className="w-full max-w-4xl mx-auto shadow-2xl print:shadow-none print:border-none bg-card">
        <CardHeader className="bg-muted/30 p-6 print:bg-transparent">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              {myCompany.logoUrl && (
                <Image 
                  src={myCompany.logoUrl} 
                  alt={`${myCompany.name} Logo`} 
                  width={150} 
                  height={50} 
                  className="mb-4 object-contain" 
                  data-ai-hint="company logo"
                />
              )}
              <p className="text-sm font-semibold text-foreground">{myCompany.name}</p>
              <p className="text-sm text-muted-foreground">{myCompany.address}</p>
              <p className="text-sm text-muted-foreground">{myCompany.email} | {myCompany.phone}</p>
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
          {clientCompany && (
            <div className="mt-4">
              <h3 className="font-semibold text-muted-foreground mb-1">BILLED TO:</h3>
              <p className="font-medium text-lg">{clientCompany.name}</p>
              <p className="text-sm text-muted-foreground">{clientCompany.address}</p>
              <p className="text-sm text-muted-foreground">{clientCompany.contactPerson} ({clientCompany.contactEmail})</p>
              {clientCompany.gstin && <p className="text-sm text-muted-foreground">GSTIN: {clientCompany.gstin}</p>}
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
                    <td className="p-3 align-top text-right">{item.quantity}{item.unitType ? ` ${item.unitType}` : ''}</td>
                    <td className="p-3 align-top text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="p-3 align-top text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Removed Subtotal, Tax, Grand Total section */}

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
            Thank you for your business! If you have any questions, please contact us at {myCompany.email}.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
