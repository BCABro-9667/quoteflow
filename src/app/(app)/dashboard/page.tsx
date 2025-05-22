import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Building2, FileText, PlusCircle, TrendingUp, Clock } from 'lucide-react';
import { StatCard } from '@/components/features/dashboard/stat-card';
import { getCompanies, getQuotations } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Company, Quotation } from '@/types';

export default async function DashboardPage() {
  const companies = await getCompanies();
  const quotations = await getQuotations();

  const totalCompanies = companies.length;
  const totalQuotations = quotations.length;
  const pendingQuotations = quotations.filter(q => q.status === 'draft' || q.status === 'sent').length;
  
  const recentCompanies = companies
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0,3);
  
  const recentQuotations = quotations
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0,3);


  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your QuoteFlow."
        icon={TrendingUp}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/companies/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Company
              </Link>
            </Button>
            <Button asChild>
              <Link href="/quotations/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Quotation
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Total Companies"
          value={totalCompanies}
          icon={Building2}
          description="Registered client companies"
        />
        <StatCard
          title="Total Quotations"
          value={totalQuotations}
          icon={FileText}
          description="Quotations generated"
          iconClassName="text-green-500"
        />
        <StatCard
          title="Pending Quotations"
          value={pendingQuotations}
          icon={Clock}
          description="Quotations awaiting action"
          iconClassName="text-orange-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
            <CardDescription>Top 3 most recently added companies.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCompanies.length > 0 ? (
              <ul className="space-y-3">
                {recentCompanies.map((company: Company) => (
                  <li key={company.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors">
                    <div>
                      <Link href={`/companies/${company.id}/edit`} className="font-medium text-primary hover:underline">{company.name}</Link>
                      <p className="text-xs text-muted-foreground">{company.contactEmail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(company.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No companies added yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
            <CardDescription>Top 3 most recently created quotations.</CardDescription>
          </CardHeader>
          <CardContent>
             {recentQuotations.length > 0 ? (
              <ul className="space-y-3">
                {recentQuotations.map((quotation: Quotation) => (
                  <li key={quotation.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors">
                    <div>
                      <Link href={`/quotations/${quotation.id}/view`} className="font-medium text-primary hover:underline">{quotation.quotationNumber}</Link>
                      <p className="text-xs text-muted-foreground">For: {quotation.companyName}</p>
                    </div>
                    {/* Use quotation.date for display as it's the primary date for a quotation entity */}
                    <span className="text-xs text-muted-foreground">{new Date(quotation.date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No quotations created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
