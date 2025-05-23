
"use client";

import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import type { quotationSchema } from "@/lib/schemas";

type QuotationFormValues = z.infer<typeof quotationSchema>;

interface ProductItemRowProps {
  form: UseFormReturn<QuotationFormValues>;
  index: number;
  remove: UseFieldArrayReturn<QuotationFormValues, "items">["remove"];
}

export function ProductItemRow({ form, index, remove }: ProductItemRowProps) {
  const quantity = form.watch(`items.${index}.quantity`);
  const unitPrice = form.watch(`items.${index}.unitPrice`);
  const totalPrice = (quantity || 0) * (unitPrice || 0);

  return (
    <div className="grid grid-cols-1 gap-4 items-start border p-4 rounded-md shadow-sm bg-card relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
        onClick={() => remove(index)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove Item {index + 1}</span>
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`items.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product/Service Name</FormLabel>
              <FormControl>
                <Input placeholder="Laptop Pro 15" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`items.${index}.hsn`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>HSN/SAC</FormLabel>
              <FormControl>
                <Input placeholder="8471" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name={`items.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Detailed product description..." {...field} rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr] gap-4 items-end">
        <FormField
          control={form.control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`items.${index}.unitType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Type</FormLabel>
              <FormControl>
                <Input placeholder="PCS / SET / KG" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`items.${index}.unitPrice`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1200.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Total Amount</FormLabel>
          <Input value={totalPrice.toFixed(2)} readOnly className="bg-muted/50" />
        </FormItem>
      </div>
    </div>
  );
}
