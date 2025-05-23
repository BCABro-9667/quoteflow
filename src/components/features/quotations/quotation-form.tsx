
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
import { Textarea } from "@/components/ui/textarea";
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
import { useActionState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type QuotationFormValues = z.infer<typeof quotationSchema>;

interface QuotationFormProps {
  quotation?: Quotation | null;
  companies: Company[];
  formAction: (prevState: any, formData: FormData) => Promise<any>;
  buttonText?: string;
  defaultQuotationNumber?: string; 
}

const initialState = {
  message: "",
  errors: {},
};


export function QuotationForm({ 
  quotation, 
  companies, 
  formAction, 
  buttonText = "Save Quotation",
  defaultQuotationNumber 
}: QuotationFormProps) {
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();
  
  const isEditing = !!quotation;

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      quotationNumber: quotation?.quotationNumber || defaultQuotationNumber || "",
      companyId: quotation?.companyId || "",
      date: quotation?.date ? new Date(quotation.date) : new Date(),
      items: quotation?.items?.map(item => ({
        ...item, 
        quantity: Number(item.quantity), 
        unitPrice: Number(item.unitPrice),
        unitType: item.unitType || undefined 
      })) || [{ id: crypto.randomUUID(), hsn: "", name: "", quantity: 1, unitPrice: 0, description: "", unitType: undefined }],
      status: quotation?.status || "draft",
      notes: quotation?.notes || "",
      createdBy: quotation?.createdBy || "QuoteFlow User", // Default creator name
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
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

  const processSubmit = async (data: QuotationFormValues) => {
    const formData = new FormData();

    formData.append('quotationNumber', data.quotationNumber);
    formData.append('companyId', data.companyId);
    if (data.date) {
        formData.append('date', data.date.toISOString());
    }
    formData.append('status', data.status);
    formData.append('notes', data.notes || '');
    formData.append('createdBy', data.createdBy);

    data.items.forEach((item, index) => {
        formData.append(`items.${index}.id`, item.id || crypto.randomUUID());
        formData.append(`items.${index}.hsn`, item.hsn);
        formData.append(`items.${index}.name`, item.name);
        formData.append(`items.${index}.description`, item.description || '');
        formData.append(`items.${index}.quantity`, item.quantity.toString());
        formData.append(`items.${index}.unitType`, item.unitType || '');
        formData.append(`items.${index}.unitPrice`, item.unitPrice.toString());
    });
    
    dispatch(formData); 
  };


  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{isEditing ? `Edit Quotation ${quotation?.quotationNumber}` : "Create New Quotation"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="quotationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quotation Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., QTN-001" {...field} />
                    </FormControl>
                    <FormDescription>Auto-generated or editable.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                onClick={() => append({ id: crypto.randomUUID(), hsn: "", name: "", quantity: 1, unitPrice: 0, description: "", unitType: undefined })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
               {form.formState.errors.items && typeof form.formState.errors.items === 'object' && !Array.isArray(form.formState.errors.items) && (
                <FormMessage>{form.formState.errors.items.message}</FormMessage>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes / Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any notes, terms, or conditions for this quotation..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="createdBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Created By</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormDescription>Name of the person preparing this quotation.</FormDescription>
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
            <Button type="submit" disabled={form.formState.isSubmitting || state?.message === "Success" /* Prevent re-submission on success */}>
              {form.formState.isSubmitting ? "Saving..." : buttonText}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
