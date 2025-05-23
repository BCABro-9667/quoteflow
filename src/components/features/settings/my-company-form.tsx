
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
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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
  const [state, dispatch] = useFormState(formAction, initialState);
  const { toast } = useToast();

  const form = useForm<MyCompanyFormValues>({
    resolver: zodResolver(myCompanySettingsSchema),
    defaultValues: {
      name: settings?.name || "",
      address: settings?.address || "",
      email: settings?.email || "",
      phone: settings?.phone || "",
      logoUrl: settings?.logoUrl || "",
    },
  });

  const currentLogoUrl = form.watch("logoUrl");

  useEffect(() => {
    if (state?.message && !state.errors) {
      toast({ title: "Success", description: state.message });
      // Optionally reset form if needed, or rely on re-fetched data if page reloads/revalidates
      // form.reset(form.getValues()); // to keep current form values after successful save
    } else if (state?.message && state.errors) {
      toast({ title: "Error", description: state.message, variant: "destructive" });
    }
  }, [state, toast, form]);

  // Reset form if settings prop changes (e.g., after successful save and revalidation)
  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Your Company Details</CardTitle>
        <CardDescription>
          This information will be used on your quotations and other documents.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form action={dispatch} className="space-y-8">
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
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a direct URL to your company's logo image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    onError={(e) => {
                      // Fallback or hide if image fails to load
                      e.currentTarget.style.display = 'none';
                      const errorMsg = form.getFieldState("logoUrl").error?.message;
                      if (!errorMsg) {
                        form.setError("logoUrl", { type: "manual", message: "Logo image could not be loaded from URL." });
                      }
                    }}
                    onLoad={(e) => {
                       e.currentTarget.style.display = 'block';
                       // Clear error if image loads successfully
                       if (form.getFieldState("logoUrl").error) {
                           form.clearErrors("logoUrl");
                       }
                    }}
                  />
                </div>
                {form.formState.errors.logoUrl?.message && !form.formState.errors.logoUrl?.message.includes("Invalid URL") && (
                   <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.logoUrl?.message}</p>
                )}
              </div>
            )}
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
