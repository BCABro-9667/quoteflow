
import { PageHeader } from "@/components/shared/page-header";
import { Settings as SettingsIcon } from "lucide-react";
import { MyCompanyForm } from "@/components/features/settings/my-company-form";
import { getMyCompanySettings } from "@/lib/mock-data";
import { updateMyCompanySettingsAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const companySettings = await getMyCompanySettings();

  return (
    <>
      <PageHeader 
        title="Application Settings" 
        icon={SettingsIcon} 
        description="Configure your company details, theme, and other application settings."
      />
      <div className="space-y-8">
        <MyCompanyForm 
          settings={companySettings} 
          formAction={updateMyCompanySettingsAction} 
        />
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Theme Customization</CardTitle>
            <CardDescription>
              Personalize the look and feel of QuoteFlow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Theme customization options (e.g., primary color, font choices, light/dark mode preferences) would be available here. 
              Currently, theme colors are set in <code>src/app/globals.css</code> and dark/light mode is toggled via the user menu.
            </p>
            {/* Placeholder for theme settings UI */}
            <div className="mt-4 p-4 border border-dashed rounded-md">
              <p className="text-sm text-center text-muted-foreground">Theme controls coming soon!</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quotation Settings</CardTitle>
            <CardDescription>
              Define default values and preferences for new quotations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Settings like default tax rate, currency, quotation number prefix, or default terms and conditions could be managed here.
            </p>
            <div className="mt-4 p-4 border border-dashed rounded-md">
              <p className="text-sm text-center text-muted-foreground">Quotation defaults coming soon!</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
}
