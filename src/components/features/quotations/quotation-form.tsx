
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"; // Keep for totals display
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { quotationSchema } from "@/lib/schemas";
import type { Company, Quotation } from "@/types";
import { ProductItemRow } from "./product-item-row";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type QuotationFormValues = z.infer<typeof quotationSchema>;

interface QuotationFormProps {
  quotation?: Quotation | null;
  companies: Company[];
  formAction: (prevState: any, formData: FormData) => Promise<any>; // Server action
  buttonText?: string;
}

const initialState = {
  message: "",
  errors: {},
};


export function QuotationForm({ quotation, companies, formAction, buttonText = "Save Quotation" }: QuotationFormProps) {
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();
  
  const isEditing = !!quotation;

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      companyId: quotation?.companyId || "",
      date: quotation?.date ? new Date(quotation.date) : new Date(), // Autofill current date
      // validUntil: undefined, // Removed from form
      items: quotation?.items?.map(item => ({
        ...item, 
        quantity: Number(item.quantity), 
        unitPrice: Number(item.unitPrice),
        unitType: item.unitType || ""
      })) || [{ id: crypto.randomUUID(), hsn: "", name: "", quantity: 1, unitPrice: 0, description: "", unitType: "" }],
      // notes: "", // Removed from form
      status: quotation?.status || "draft", // Default to draft, not shown as input
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const [subTotal, setSubTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0); 
  const [grandTotal, setGrandTotal] = useState(0);
  const taxRate = 0.18; // Example tax rate, should ideally be configurable

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("items")) {
        const items = value.items || [];
        const currentSubTotal = items.reduce((acc, item) => acc + (item?.quantity || 0) * (item?.unitPrice || 0), 0);
        setSubTotal(currentSubTotal);
        const currentTaxAmount = currentSubTotal * taxRate;
        setTaxAmount(currentTaxAmount);
        setGrandTotal(currentSubTotal + currentTaxAmount);
      }
    });
    // Calculate initial totals
    const initialItems = form.getValues("items") || [];
    const currentSubTotal = initialItems.reduce((acc, item) => acc + (item?.quantity || 0) * (item?.unitPrice || 0), 0);
    setSubTotal(currentSubTotal);
    const currentTaxAmount = currentSubTotal * taxRate;
    setTaxAmount(currentTaxAmount);
    setGrandTotal(currentSubTotal + currentTaxAmount);

    return () => subscription.unsubscribe();
  }, [form, taxRate]);

  useEffect(() => {
    if (state?.message && !state.errors) {
      toast({ title: "Success", description: state.message });
    } else if (state?.message && state.errors) {
      toast({ title: "Error", description: state.message, variant: "destructive" });
       if (state.errors) {
        Object.entries(state.errors).forEach(([fieldName, fieldErrors]) => {
          if (Array.isArray(fieldErrors)) {
            form.setError(fieldName as keyof QuotationFormValues, {
              type: "manual",
              message: fieldErrors.join(", "),
            });
          }
        });
      }
    }
  }, [state, toast, form]);


  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Quotation" : "Create New Quotation"}</CardTitle>
        {!isEditing && <p className="text-sm text-muted-foreground">Quotation number will be auto-generated.</p>}
      </CardHeader>
      <Form {...form}>
        <form action={dispatch} className="space-y-8">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Quotation Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          // disabled={(date) => date > new Date() || date < new Date("1900-01-01")} // Can allow future dates if needed
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Hidden field for status, defaulted to 'draft' */}
            <input type="hidden" {...form.register("status")} />


            <div>
              <h3 className="text-lg font-semibold mb-2 block">Items</h3>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <ProductItemRow key={field.id} form={form} index={index} remove={remove} />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ id: crypto.randomUUID(), hsn: "", name: "", quantity: 1, unitPrice: 0, description: "", unitType: "" })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
               {form.formState.errors.items && typeof form.formState.errors.items === 'object' && !Array.isArray(form.formState.errors.items) && (
                <FormMessage>{form.formState.errors.items.message}</FormMessage>
              )}
            </div>

            <div className="mt-6 space-y-2 text-right">
              <p className="text-md">Subtotal: <span className="font-semibold">${subTotal.toFixed(2)}</span></p>
              <p className="text-md">Tax ({taxRate * 100}%): <span className="font-semibold">${taxAmount.toFixed(2)}</span></p>
              <p className="text-xl font-bold">Grand Total: <span className="text-primary">${grandTotal.toFixed(2)}</span></p>
            </div>

            {state?.message && state.errors && Object.keys(state.errors).length === 0 && (
                <p className="text-sm font-medium text-destructive">{state.message}</p>
             )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/quotations">Cancel</Link>
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
