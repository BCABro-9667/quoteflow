
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
import { FileText, PlusCircle, Search, Loader2, CheckCircle, Send } from "lucide-react";
import { getQuotations } from "@/lib/mock-data";
import { QuotationActions } from "@/components/features/quotations/quotation-actions";
import type { Quotation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { QuotationPageActions } from "@/components/features/quotations/quotation-page-actions";
import { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toggleQuotationStatusAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function getStatusBadgeVariant(status: Quotation['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'accepted':
      return 'default'; 
    case 'sent':
      return 'secondary';
    case 'draft': // "Pending" will use outline
      return 'outline';
    case 'rejected':
      return 'destructive';
    case 'archived':
      return 'secondary'; 
    default:
      return 'outline';
  }
}

function QuotationsTable({ 
  quotations,
  onStatusToggle
}: { 
  quotations: Quotation[],
  onStatusToggle: (quotationId: string, currentStatus: Quotation['status']) => void;
}) {
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

  const getStatusDisplay = (status: Quotation['status']) => {
    if (status === 'draft') return 'Pending';
    if (status === 'sent') return 'Sent';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
              <TableHead>Company Name</TableHead>
              <TableHead className="hidden sm:table-cell">Company Email</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quotation) => {
              const isToggleable = quotation.status === 'draft' || quotation.status === 'sent';
              return (
                <TableRow key={quotation.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Link href={`/quotations/${quotation.id}/view`} className="font-medium text-primary hover:underline">
                        {quotation.quotationNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{quotation.companyName || 'N/A'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{quotation.companyEmail || 'N/A'}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(new Date(quotation.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusBadgeVariant(quotation.status)} 
                      className={cn("capitalize", isToggleable && "cursor-pointer hover:opacity-80")}
                      onClick={isToggleable ? () => onStatusToggle(quotation.id, quotation.status) : undefined}
                      title={isToggleable ? `Click to toggle status` : `Status: ${getStatusDisplay(quotation.status)}`}
                    >
                      {getStatusDisplay(quotation.status)}
                      {isToggleable && quotation.status === 'draft' && <Send className="ml-1.5 h-3 w-3" />}
                      {isToggleable && quotation.status === 'sent' && <CheckCircle className="ml-1.5 h-3 w-3" />}
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
  const [isTogglingStatus, startStatusToggleTransition] = useTransition();
  const { toast } = useToast();

  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    let quotationsData = await getQuotations();
    if (initialCompanyId) {
      quotationsData = quotationsData.filter(q => q.companyId === initialCompanyId);
    }
    setAllQuotations(quotationsData);
    setIsLoading(false);
  }, [initialCompanyId]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const filteredQuotations = useMemo(() => {
    if (!searchQuery) return allQuotations;
    const lowercasedQuery = searchQuery.toLowerCase();
    return allQuotations.filter(quotation =>
      quotation.quotationNumber.toLowerCase().includes(lowercasedQuery) ||
      (quotation.companyName && quotation.companyName.toLowerCase().includes(lowercasedQuery)) ||
      (quotation.companyEmail && quotation.companyEmail.toLowerCase().includes(lowercasedQuery)) ||
      quotation.status.toLowerCase().includes(lowercasedQuery)
    );
  }, [allQuotations, searchQuery]);

  const handleStatusToggle = (quotationId: string, currentStatus: Quotation['status']) => {
    startStatusToggleTransition(async () => {
      const result = await toggleQuotationStatusAction(quotationId, currentStatus);
      if (result.error) {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: result.message });
        // No need to manually refetch, revalidatePath in action handles it.
        // For faster UI update, you could optimistically update allQuotations state here
        // or rely on the revalidation which might be slightly delayed.
        // For now, relying on revalidation which calls fetchQuotations again via useEffect.
      }
    });
  };
  
  return (
    <>
      <PageHeader
        title={initialCompanyId ? `Quotations for ${allQuotations.find(q => q.companyId === initialCompanyId)?.companyName || 'Selected Company'}` : "Manage Quotations"}
        icon={FileText}
        description={initialCompanyId ? "Viewing quotations filtered by company." : "Create, view, edit, or delete quotations."}
        actions={<QuotationPageActions />}
      />
      {!initialCompanyId && ( 
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by number, company, email, status..."
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
        <QuotationsTable quotations={filteredQuotations} onStatusToggle={handleStatusToggle} />
      )}
    </>
  );
}
