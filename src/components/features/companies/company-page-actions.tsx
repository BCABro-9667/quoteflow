
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle } from "lucide-react";

export function CompanyPageActions() {
  const handleExport = () => {
    console.log("Exporting all companies...");
    // In a real app, this might trigger an API call or a server action for export
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Export All
      </Button>
      <Button asChild>
        <Link href="/companies/new">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Company
        </Link>
      </Button>
    </div>
  );
}
