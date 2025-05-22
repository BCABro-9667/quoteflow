"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { quotationSchema } from "@/lib/actions";
import type { Company, Quotation, ProductItem as ProductItemType } from "@/types";
import { ProductItemRow } from "./product-item-row";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
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
  const [state, dispatch] = useFormState(formAction, initialState);
  const { toast } = useToast();
  
  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      companyId: quotation?.companyId || "",
      date: quotation?.date ? new Date(quotation.date) : new Date(),
      validUntil: quotation?.validUntil ? new Date(quotation.validUntil) : undefined,
      items: quotation?.items?.map(item => ({...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice)})) || [{ hsn: "", name: "", quantity: 1, unitPrice: 0, description: "", imageUrl: "" }],
      notes: quotation?.notes || "",
      status: quotation?.status || "draft",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const [subTotal, setSubTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0); // Assuming 18% tax for example
  const [grandTotal, setGrandTotal] = useState(0);
  const taxRate = 0.18; // Example tax rate

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
       // Populate form errors
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
        <CardTitle>{quotation ? "Edit Quotation" : "Create New Quotation"}</CardTitle>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["draft", "sent", "accepted", "rejected", "archived"].map((statusVal) => (
                          <SelectItem key={statusVal} value={statusVal}>
                            {statusVal.charAt(0).toUpperCase() + statusVal.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid Until (Optional)</FormLabel>
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
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                           disabled={(date) => date < (form.getValues("date") || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel className="text-lg font-semibold mb-2 block">Items</FormLabel>
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
                onClick={() => append({ id: crypto.randomUUID(), hsn: "", name: "", quantity: 1, unitPrice: 0, description: "", imageUrl: "" })}
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes/Terms (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes or terms and conditions..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
