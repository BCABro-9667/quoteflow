
import { PageHeader } from "@/components/shared/page-header";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <>
      <PageHeader 
        title="User Profile" 
        icon={User} 
        description="Manage your personal information and preferences." 
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is where you would manage your user profile details. 
            Functionality for editing profile information (name, email, password, etc.) would be implemented here.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <p className="font-medium">Name:</p>
              <p className="text-muted-foreground">QuoteFlow User</p>
            </div>
            <div>
              <p className="font-medium">Email:</p>
              <p className="text-muted-foreground">user@example.com</p>
            </div>
            <div>
              <p className="font-medium">Role:</p>
              <p className="text-muted-foreground">Administrator</p>
            </div>
            {/* Add more profile fields or edit functionality here */}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
