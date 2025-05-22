import { CompanyForm } from "@/components/features/companies/company-form";
import { PageHeader } from "@/components/shared/page-header";
import { createCompanyAction } from "@/lib/actions";
import { Building2 } from "lucide-react";

export default function NewCompanyPage() {
  return (
    <>
      <PageHeader title="Add New Company" icon={Building2} description="Register a new client company in the system." />
      <CompanyForm formAction={createCompanyAction} buttonText="Create Company" />
    </>
  );
}
