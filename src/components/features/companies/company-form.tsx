
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
import { companySchema } from "@/lib/schemas";
import type { Company } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  company?: Company | null;
  formAction: (prevState: any, formData: FormData) => Promise<any>; // Server action
  buttonText?: string;
}

const initialState = {
  message: "",
  errors: {},
};

export function CompanyForm({ company, formAction, buttonText = "Save Company" }: CompanyFormProps) {
  const [state, dispatch] = useFormState(formAction, initialState);
  const { toast } = useToast();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || "",
      address: company?.address || "",
      contactPerson: company?.contactPerson || "",
      contactEmail: company?.contactEmail || "",
      contactPhone: company?.contactPhone || "",
      gstin: company?.gstin || "",
    },
  });

  useEffect(() => {
    if (state?.message && !state.errors) {
      toast({ title: "Success", description: state.message });
    } else if (state?.message && state.errors) {
      toast({ title: "Error", description: state.message, variant: "destructive" });
    }
  }, [state, toast]);


  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{company ? "Edit Company" : "Create New Company"}</CardTitle>
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
                    <Input placeholder="Innovatech Solutions Ltd." {...field} />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Tech Park, Silicon Valley, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Alice Wonderland" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="alice@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1-555-0100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="27ABCDE1234F1Z5" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the Goods and Services Tax Identification Number.
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
            <Button type="button" variant="outline" asChild>
              <Link href="/companies">Cancel</Link>
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : buttonText}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
