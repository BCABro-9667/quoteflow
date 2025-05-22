
"use client";

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
import { FileText, PlusCircle, Search, Loader2 } from "lucide-react";
import { getQuotations } from "@/lib/mock-data";
import { QuotationActions } from "@/components/features/quotations/quotation-actions";
import type { Quotation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { QuotationPageActions } from "@/components/features/quotations/quotation-page-actions";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation"; // For reading initial companyId filter

function getStatusBadgeVariant(status: Quotation['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'accepted':
      return 'default'; 
    case 'sent':
      return 'secondary';
    case 'draft':
      return 'outline';
    case 'rejected':
      return 'destructive';
    case 'archived':
      return 'secondary'; 
    default:
      return 'outline';
  }
}

function QuotationsTable({ quotations }: { quotations: Quotation[] }) {
  if (quotations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Quotations Found</h3>
        <p className="text-muted-foreground mb-4">
          Your search returned no results, or you haven't created any quotations yet.
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

export default function QuotationsPage() {
  const searchParams = useSearchParams();
  const initialCompanyId = searchParams.get('companyId');

  const [allQuotations, setAllQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      let quotationsData = await getQuotations();
      if (initialCompanyId) {
        quotationsData = quotationsData.filter(q => q.companyId === initialCompanyId);
      }
      setAllQuotations(quotationsData);
      setIsLoading(false);
    }
    fetchData();
  }, [initialCompanyId]);

  const filteredQuotations = useMemo(() => {
    if (!searchQuery) return allQuotations;
    const lowercasedQuery = searchQuery.toLowerCase();
    return allQuotations.filter(quotation =>
      quotation.quotationNumber.toLowerCase().includes(lowercasedQuery) ||
      (quotation.companyName && quotation.companyName.toLowerCase().includes(lowercasedQuery)) ||
      quotation.status.toLowerCase().includes(lowercasedQuery)
    );
  }, [allQuotations, searchQuery]);
  
  return (
    <>
      <PageHeader
        title={initialCompanyId ? `Quotations for ${allQuotations.find(q => q.companyId === initialCompanyId)?.companyName || 'Selected Company'}` : "Manage Quotations"}
        icon={FileText}
        description={initialCompanyId ? "Viewing quotations filtered by company." : "Create, view, edit, or delete quotations."}
        actions={<QuotationPageActions />}
      />
      {!initialCompanyId && ( // Only show search bar if not filtering by companyId from URL
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by number, company, status..."
              className="w-full rounded-md bg-background pl-10 py-2 h-10 border shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}
      {isLoading ? (
         <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading quotations...</span>
        </div>
      ) : (
        <QuotationsTable quotations={filteredQuotations} />
      )}
    </>
  );
}
