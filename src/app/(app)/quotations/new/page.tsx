
import { QuotationForm } from "@/components/features/quotations/quotation-form";
import { PageHeader } from "@/components/shared/page-header";
import { createQuotationAction } from "@/lib/actions";
import * as db from "@/lib/database"; // Changed from mock-data
import { FileText } from "lucide-react";

export default async function NewQuotationPage() {
  const companies = await db.getCompanies(); // Changed from mock-data
  const myCompanySettings = await db.getMyCompanySettings(); // Changed from mock-data

  const defaultQuotationNumber = `${myCompanySettings.quotationPrefix}${String(myCompanySettings.quotationNextNumber).padStart(3, '0')}`;

  return (
    <>
      <PageHeader title="Create New Quotation" icon={FileText} description="Generate a new quotation for a client." />
      <QuotationForm 
        companies={companies} 
        formAction={createQuotationAction} 
        buttonText="Create Quotation"
        defaultQuotationNumber={defaultQuotationNumber}
      />
    </>
  );
}
