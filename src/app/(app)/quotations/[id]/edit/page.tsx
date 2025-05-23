
import { QuotationForm } from "@/components/features/quotations/quotation-form";
import { PageHeader } from "@/components/shared/page-header";
import { updateQuotationAction } from "@/lib/actions";
import * as db from "@/lib/database"; // Changed from mock-data
import { FileText } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditQuotationPage({ params }: { params: { id: string } }) {
  const quotation = await db.getQuotationById(params.id); // Changed from mock-data
  const companies = await db.getCompanies(); // Changed from mock-data

  if (!quotation) {
    notFound();
  }
  
  const updateQuotationActionWithId = updateQuotationAction.bind(null, params.id);

  return (
    <>
      <PageHeader title="Edit Quotation" icon={FileText} description={`Update details for quotation ${quotation.quotationNumber}.`} />
      <QuotationForm quotation={quotation} companies={companies} formAction={updateQuotationActionWithId} buttonText="Save Changes" />
    </>
  );
}
