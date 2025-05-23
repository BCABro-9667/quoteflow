
"use client";

import Link from "next/link";
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
import { QuotationActions } from "./quotation-actions";
import type { Quotation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import { toggleQuotationStatusAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

function QuotationsTable({ 
  quotations,
  onStatusToggle,
  isTogglingStatus // Pass this down to disable clicks during transition
}: { 
  quotations: Quotation[],
  onStatusToggle: (quotationId: string, currentStatus: Quotation['status']) => void;
  isTogglingStatus: boolean;
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
                      className={cn(
                        "capitalize", 
                        isToggleable && !isTogglingStatus && "cursor-pointer hover:opacity-80",
                        isTogglingStatus && "cursor-not-allowed opacity-50"
                      )}
                      onClick={isToggleable && !isTogglingStatus ? () => onStatusToggle(quotation.id, quotation.status) : undefined}
                      title={isToggleable ? `Click to toggle status` : `Status: ${getStatusDisplay(quotation.status)}`}
                    >
                      {isTogglingStatus && (quotation.status === 'draft' || quotation.status === 'sent') ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : null}
                      {getStatusDisplay(quotation.status)}
                      {isToggleable && quotation.status === 'draft' && !isTogglingStatus && <Send className="ml-1.5 h-3 w-3" />}
                      {isToggleable && quotation.status === 'sent' && !isTogglingStatus && <CheckCircle className="ml-1.5 h-3 w-3" />}
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

interface QuotationsClientPageProps {
  initialQuotations: Quotation[];
  activeCompanyFilterId?: string;
}

export function QuotationsClientPage({ initialQuotations, activeCompanyFilterId }: QuotationsClientPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTogglingStatus, startStatusToggleTransition] = useTransition();
  const { toast } = useToast();
  
  // The list of quotations is now managed by the prop and filtering
  // No need for setIsLoading for the initial load as data is server-rendered or passed as prop

  const filteredQuotations = useMemo(() => {
    // initialQuotations is already filtered by activeCompanyFilterId if it was provided to the server component
    let quotationsToFilter = initialQuotations;

    if (!searchQuery) return quotationsToFilter;
    
    const lowercasedQuery = searchQuery.toLowerCase();
    return quotationsToFilter.filter(quotation =>
      quotation.quotationNumber.toLowerCase().includes(lowercasedQuery) ||
      (quotation.companyName && quotation.companyName.toLowerCase().includes(lowercasedQuery)) ||
      (quotation.companyEmail && quotation.companyEmail.toLowerCase().includes(lowercasedQuery)) ||
      quotation.status.toLowerCase().includes(lowercasedQuery)
    );
  }, [initialQuotations, searchQuery]);

  const handleStatusToggle = (quotationId: string, currentStatus: Quotation['status']) => {
    startStatusToggleTransition(async () => {
      const result = await toggleQuotationStatusAction(quotationId, currentStatus);
      if (result.error) {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: result.message });
        // Data refresh will be handled by Next.js revalidating the path
        // and the server component re-fetching and passing new initialQuotations.
      }
    });
  };
  
  return (
    <>
      {/* Search input is only shown if not actively filtering by a companyId from URL params */}
      {!activeCompanyFilterId && ( 
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
      {/* 
        The main loading state (e.g. "Loading quotations...") for initial page load is handled by the Server Component.
        If `initialQuotations` is empty, the `QuotationsTable` will show its "No Quotations Found" message.
      */}
      <QuotationsTable 
        quotations={filteredQuotations} 
        onStatusToggle={handleStatusToggle}
        isTogglingStatus={isTogglingStatus}
      />
    </>
  );
}
