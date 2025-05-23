
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { myCompanySettingsSchema } from "@/lib/schemas";
import type { MyCompanySettings } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useActionState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

type MyCompanyFormValues = z.infer<typeof myCompanySettingsSchema>;

interface MyCompanyFormProps {
  settings: MyCompanySettings;
  formAction: (prevState: any, formData: FormData) => Promise<any>; // Server action
}

const initialState = {
  message: "",
  errors: {},
};

export function MyCompanyForm({ settings, formAction }: MyCompanyFormProps) {
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<MyCompanyFormValues>({
    resolver: zodResolver(myCompanySettingsSchema),
    defaultValues: {
      name: settings?.name || "",
      address: settings?.address || "",
      email: settings?.email || "",
      phone: settings?.phone || "",
      logoUrl: settings?.logoUrl || "",
      website: settings?.website || "",
      quotationPrefix: settings?.quotationPrefix || "QTN-",
      quotationNextNumber: settings?.quotationNextNumber || 1,
    },
  });

  const currentLogoUrl = form.watch("logoUrl");

  useEffect(() => {
    if (state?.message && !state.errors) {
      toast({ title: "Success", description: state.message });
    } else if (state?.message && state.errors) {
      toast({ title: "Error", description: state.message, variant: "destructive" });
       // Apply field-specific errors from server action to the form
       if (state.errors && typeof state.errors === 'object') {
        Object.entries(state.errors).forEach(([fieldName, fieldErrors]) => {
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            form.setError(fieldName as keyof MyCompanyFormValues, {
              type: "manual",
              message: fieldErrors.join(", "),
            });
          }
        });
      }
    }
  }, [state, toast, form]);

  // Reset form if settings prop changes (e.g., after successful save and revalidation)
  useEffect(() => {
    form.reset({
        name: settings?.name || "",
        address: settings?.address || "",
        email: settings?.email || "",
        phone: settings?.phone || "",
        logoUrl: settings?.logoUrl || "",
        website: settings?.website || "",
        quotationPrefix: settings?.quotationPrefix || "QTN-",
        quotationNextNumber: settings?.quotationNextNumber || 1,
    });
  }, [settings, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("logoUrl", reader.result as string, { shouldValidate: true, shouldDirty: true });
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected (e.g., user clears the file input), clear the logoUrl
      // Or, you might want to revert to a previously saved URL if you store that separately.
      // For this prototype, clearing it or setting to empty string is fine.
      form.setValue("logoUrl", "", { shouldValidate: true, shouldDirty: true });
    }
  };
  
  const processSubmit = (data: MyCompanyFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'quotationNextNumber') {
          formData.append(key, String(value));
        } else {
          formData.append(key, value as string);
        }
      }
    });
    // If a file was selected, its Data URI is already in data.logoUrl
    // If no file was selected and it was cleared, logoUrl might be ""
    // If a file was never touched and there was an existing URL, it's in data.logoUrl
    dispatch(formData);
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Your Company Details</CardTitle>
        <CardDescription>
          This information will be used on your quotations and other documents.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Awesome Company LLC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Main St, Anytown, USA 12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@yourcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1-555-123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* File Input for Logo */}
            <FormItem>
              <FormLabel htmlFor="logoFile">Company Logo</FormLabel>
              <Input
                id="logoFile"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/svg+xml"
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary/10 file:text-primary
                  hover:file:bg-primary/20"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <FormDescription>
                Upload your company's logo (PNG, JPG, GIF, SVG). Max 2MB.
              </FormDescription>
              <FormField
                control={form.control}
                name="logoUrl"
                render={() => <FormMessage />} // Error message for logoUrl (e.g. if server-side validation fails)
              />
            </FormItem>

            {currentLogoUrl && (
              <div>
                <FormLabel>Logo Preview</FormLabel>
                <div className="mt-2 p-4 border rounded-md inline-block bg-muted/30">
                  <Image 
                    src={currentLogoUrl} 
                    alt="Company Logo Preview" 
                    width={150} 
                    height={50} 
                    className="object-contain"
                    data-ai-hint="company logo"
                    unoptimized={currentLogoUrl.startsWith('data:')} // Important for Data URIs
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      // Don't set form error here if it's just a preview loading issue for an external URL
                      // Server-side validation will catch invalid actual URLs
                    }}
                    onLoad={(e) => {
                       e.currentTarget.style.display = 'block';
                    }}
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourcompany.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    If provided, your company name on quotations will link here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />
            <h3 className="text-lg font-medium">Quotation Numbering</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="quotationPrefix"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Quotation Prefix</FormLabel>
                    <FormControl>
                        <Input placeholder="QTN-" {...field} />
                    </FormControl>
                    <FormDescription>
                        E.g., &quot;INV-&quot;, &quot;ET/2024-25/&quot;. Leave blank for no prefix.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="quotationNextNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Next Quotation Number</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="1" {...field} 
                         onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                        />
                    </FormControl>
                    <FormDescription>
                        The next number to use (e.g., 1, 101). Will be padded to 3 digits.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            {state?.message && state.errors && Object.keys(state.errors).length === 0 && (
                <p className="text-sm font-medium text-destructive">{state.message}</p>
             )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Company Settings"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
