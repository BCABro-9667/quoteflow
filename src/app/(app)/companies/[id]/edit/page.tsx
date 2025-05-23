
import { CompanyForm } from "@/components/features/companies/company-form";
import { PageHeader } from "@/components/shared/page-header";
import { updateCompanyAction } from "@/lib/actions";
import * as db from "@/lib/database"; // Changed from mock-data
import { Building2 } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const company = await db.getCompanyById(params.id); // Changed from mock-data

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
