import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle, Search, Download } from "lucide-react";
import { getQuotations } from "@/lib/mock-data";
import { QuotationActions } from "@/components/features/quotations/quotation-actions";
import type { Quotation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

function getStatusBadgeVariant(status: Quotation['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'accepted':
      return 'default'; // Or a success green, if defined
    case 'sent':
      return 'secondary';
    case 'draft':
      return 'outline';
    case 'rejected':
      return 'destructive';
    case 'archived':
      return 'secondary'; // Or a specific archive color
    default:
      return 'outline';
  }
}

async function QuotationsTable({ quotations }: { quotations: Quotation[] }) {
  if (quotations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Quotations Found</h3>
        <p className="text-muted-foreground mb-4">
          Start by creating your first quotation for a client.
        </p>
        <Button asChild>
          <Link href="/quotations/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Quotation
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Quotation Records</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quotation) => {
              const subTotal = quotation.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
              const grandTotal = subTotal * 1.18; // Assuming 18% tax
              return (
                <TableRow key={quotation.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Link href={`/quotations/${quotation.id}/view`} className="font-medium text-primary hover:underline">
                        {quotation.quotationNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{quotation.companyName || 'N/A'}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(new Date(quotation.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="hidden md:table-cell">${grandTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(quotation.status)} className="capitalize">
                      {quotation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <QuotationActions quotation={quotation} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams?: { query?: string; companyId?: string };
}) {
  let quotations = await getQuotations();
  
  if (searchParams?.companyId) {
    quotations = quotations.filter(q => q.companyId === searchParams.companyId);
  }
  // Add filtering by query if needed

  return (
    <>
      <PageHeader
        title="Manage Quotations"
        icon={FileText}
        description="Create, view, edit, or delete quotations."
        actions={
           <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={() => console.log("Exporting quotations...")}>
                <Download className="mr-2 h-4 w-4" />
                Export All
            </Button>
            <Button asChild>
              <Link href="/quotations/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Quotation
              </Link>
            </Button>
          </div>
        }
      />
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by number, company, status..."
            className="w-full rounded-md bg-background pl-10 py-2 h-10 border shadow-sm"
            // Implement search
          />
        </div>
      </div>
      <QuotationsTable quotations={quotations} />
    </>
  );
}
