
import { PageHeader } from "@/components/shared/page-header";
import { FileText } from "lucide-react";
import * as db from "@/lib/database";
import type { Quotation } from "@/types";
import { QuotationPageActions } from "@/components/features/quotations/quotation-page-actions";
import { QuotationsClientPage } from "@/components/features/quotations/quotations-client-page";

export default async function QuotationsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const companyIdFilter = typeof searchParams?.companyId === 'string' ? searchParams.companyId : undefined;

  let fetchedQuotations: Quotation[] = [];
  let companyNameForTitle: string | undefined;
  let pageError: string | null = null;

  try {
    fetchedQuotations = await db.getQuotations();
    if (companyIdFilter) {
      const originalLength = fetchedQuotations.length;
      fetchedQuotations = fetchedQuotations.filter(q => q.companyId === companyIdFilter);
      
      if (fetchedQuotations.length > 0) {
        companyNameForTitle = fetchedQuotations[0].companyName;
      } else if (originalLength > 0 || !fetchedQuotations.find(q => q.companyId === companyIdFilter)) {
        // If filtering resulted in an empty list, but there were quotations,
        // or if the specific companyId wasn't found among populated companyNames (which might happen with direct ID)
        // try to get company name directly for a better title.
        const company = await db.getCompanyById(companyIdFilter);
        companyNameForTitle = company?.name;
      }
    }
  } catch (error) {
    console.error("Failed to fetch quotations for page:", error);
    pageError = "Could not load quotations. Please try again later.";
    // Pass empty array in case of error so client page can render empty state
    fetchedQuotations = [];
  }

  return (
    <>
      <PageHeader
        title={companyIdFilter ? `Quotations for ${companyNameForTitle || 'Selected Company'}` : "Manage Quotations"}
        icon={FileText}
        description={companyIdFilter ? "Viewing quotations filtered by company." : "Create, view, edit, or delete quotations."}
        actions={<QuotationPageActions />}
      />
      {pageError && (
        <div className="p-4 mb-4 text-sm text-destructive-foreground bg-destructive rounded-md" role="alert">
          {pageError}
        </div>
      )}
      <QuotationsClientPage 
        initialQuotations={fetchedQuotations} 
        activeCompanyFilterId={companyIdFilter} 
      />
    </>
  );
}
