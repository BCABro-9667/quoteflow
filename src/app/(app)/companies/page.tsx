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
import { Building2, PlusCircle, Search, Download } from "lucide-react";
import { getCompanies } from "@/lib/mock-data";
import { CompanyActions } from "@/components/features/companies/company-actions";
import type { Company } from "@/types";
import { Badge } from "@/components/ui/badge";

// This component will handle client-side filtering if we add it
// For now, it's mostly a server component rendering static list
async function CompaniesTable({ companies }: { companies: Company[] }) {
  // const [searchTerm, setSearchTerm] = useState("");
  // const filteredCompanies = companies.filter(company =>
  //   company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  // );

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
        {/* 
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search companies..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              // value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        */}
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
  const companies = await getCompanies(); // In a real app, pass searchParams to backend
  // const query = searchParams?.query || ""; 
  // Implement filtering based on query if needed (mockApi could be extended)

  return (
    <>
      <PageHeader
        title="Manage Companies"
        icon={Building2}
        description="View, add, edit, or delete client companies."
        actions={
          <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={() => console.log("Exporting companies...")}>
                <Download className="mr-2 h-4 w-4" />
                Export All
            </Button>
            <Button asChild>
              <Link href="/companies/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Company
              </Link>
            </Button>
          </div>
        }
      />
       <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, contact, email..."
            className="w-full rounded-md bg-background pl-10 py-2 h-10 border shadow-sm"
            // Implement search functionality with onchange event if needed for client-side search
            // For server-side search, this input would trigger a form submission or query param change
          />
        </div>
      </div>
      <CompaniesTable companies={companies} />
    </>
  );
}
