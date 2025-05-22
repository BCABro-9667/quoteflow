import { QuotationForm } from "@/components/features/quotations/quotation-form";
import { PageHeader } from "@/components/shared/page-header";
import { updateQuotationAction } from "@/lib/actions";
import { getCompanies, getQuotationById } from "@/lib/mock-data";
import { FileText } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditQuotationPage({ params }: { params: { id: string } }) {
  const quotation = await getQuotationById(params.id);
  const companies = await getCompanies();

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
