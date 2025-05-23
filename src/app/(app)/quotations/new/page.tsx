
import { QuotationForm } from "@/components/features/quotations/quotation-form";
import { PageHeader } from "@/components/shared/page-header";
import { createQuotationAction } from "@/lib/actions";
import { getCompanies, getMyCompanySettings } from "@/lib/mock-data";
import { FileText } from "lucide-react";

export default async function NewQuotationPage() {
  const companies = await getCompanies();
  const myCompanySettings = await getMyCompanySettings();

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

