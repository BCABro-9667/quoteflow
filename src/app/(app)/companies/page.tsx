
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
import { Building2, PlusCircle, Search } from "lucide-react"; // Removed Download as it's in CompanyPageActions
import { getCompanies } from "@/lib/mock-data";
import { CompanyActions } from "@/components/features/companies/company-actions";
import type { Company } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CompanyPageActions } from "@/components/features/companies/company-page-actions";

async function CompaniesTable({ companies }: { companies: Company[] }) {
  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Companies Found</h3>
        <p className="text-muted-foreground mb-4">
          Get started by adding your first client company.
        </p>
        <Button asChild>
          <Link href="/companies/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Company
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Company Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Contact Person</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">GSTIN</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="font-medium">{company.name}</div>
                  <div className="text-xs text-muted-foreground md:hidden">{company.contactPerson}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{company.contactPerson}</TableCell>
                <TableCell className="hidden lg:table-cell">{company.contactEmail}</TableCell>
                <TableCell className="hidden lg:table-cell">{company.contactPhone}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {company.gstin ? <Badge variant="secondary">{company.gstin}</Badge> : <span className="text-muted-foreground text-xs">N/A</span>}
                </TableCell>
                <TableCell className="text-right">
                  <CompanyActions company={company} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


export default async function CompaniesPage({
  searchParams,
}: {
  searchParams?: { query?: string; page?: string };
}) {
  const companies = await getCompanies(); 

  return (
    <>
      <PageHeader
        title="Manage Companies"
        icon={Building2}
        description="View, add, edit, or delete client companies."
        actions={<CompanyPageActions />}
      />
       <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, contact, email..."
            className="w-full rounded-md bg-background pl-10 py-2 h-10 border shadow-sm"
          />
        </div>
      </div>
      <CompaniesTable companies={companies} />
    </>
  );
}
