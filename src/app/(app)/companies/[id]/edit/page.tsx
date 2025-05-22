import { CompanyForm } from "@/components/features/companies/company-form";
import { PageHeader } from "@/components/shared/page-header";
import { updateCompanyAction } from "@/lib/actions";
import { getCompanyById } from "@/lib/mock-data";
import { Building2 } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const company = await getCompanyById(params.id);

  if (!company) {
    notFound();
  }

  const updateCompanyActionWithId = updateCompanyAction.bind(null, params.id);

  return (
    <>
      <PageHeader title="Edit Company" icon={Building2} description={`Update details for ${company.name}.`} />
      <CompanyForm company={company} formAction={updateCompanyActionWithId} buttonText="Save Changes" />
    </>
  );
}
