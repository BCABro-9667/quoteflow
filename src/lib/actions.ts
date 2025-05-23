
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Company, Quotation, ProductItem, MyCompanySettings } from "@/types";
import * as mockApi from "./mock-data"; // Using mock API
import { companySchema, companyUpdateSchema, quotationSchema, myCompanySettingsSchema } from "./schemas";
import type { z } from "zod";

// Company Actions
export async function createCompanyAction(prevState: any, formData: FormData) {
  const validatedFields = companySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  try {
    await mockApi.addCompany(validatedFields.data);
  } catch (e) {
    return { message: "Failed to create company." };
  }

  revalidatePath("/companies");
  revalidatePath("/dashboard");
  redirect("/companies");
}

export async function updateCompanyAction(id: string, prevState: any, formData: FormData) {
  const validatedFields = companyUpdateSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }
  
  try {
    await mockApi.updateCompany(id, validatedFields.data);
  } catch (e) {
    return { message: "Failed to update company." };
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}/edit`);
  revalidatePath("/dashboard");
  redirect("/companies");
}

export async function deleteCompanyAction(id: string) {
  try {
    await mockApi.deleteCompany(id);
    revalidatePath("/companies");
    revalidatePath("/dashboard");
    return { message: "Company deleted successfully." };
  } catch (e) {
    return { message: "Failed to delete company." };
  }
}


// Quotation Actions
type QuotationFormValues = z.infer<typeof quotationSchema>;

export async function createQuotationAction(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const items: Omit<ProductItem, 'id'>[] = [];
  for (let i = 0; ; i++) {
    const itemNameKey = `items.${i}.name`; // Changed to dot notation
    if (!Object.prototype.hasOwnProperty.call(rawData, itemNameKey)) break;
    
    items.push({
      hsn: rawData[`items.${i}.hsn`]?.toString() || '',
      name: rawData[itemNameKey]?.toString() || '',
      description: rawData[`items.${i}.description`]?.toString() || '',
      imageUrl: rawData[`items.${i}.imageUrl`]?.toString() || '',
      quantity: parseFloat(rawData[`items.${i}.quantity`]?.toString() || '0'),
      unitType: rawData[`items.${i}.unitType`]?.toString() || '',
      unitPrice: parseFloat(rawData[`items.${i}.unitPrice`]?.toString() || '0'),
    });
  }

  const dataToValidate = {
    companyId: rawData.companyId as string,
    date: rawData.date ? new Date(rawData.date as string) : undefined, // Handle potentially missing date robustly for validation
    items: items,
    status: (rawData.status as Quotation['status']) || "draft",
  };
  
  const validatedFields = quotationSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.log("Validation Errors (Create):", JSON.stringify(validatedFields.error.flatten(), null, 2));
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed for quotation.",
    };
  }
  
  try {
    const quotationPayload: Omit<Quotation, "id" | "quotationNumber" | "createdAt" | "updatedAt" | "companyName" | "companyEmail" | "validUntil" | "notes"> = {
        ...validatedFields.data,
    };
    await mockApi.addQuotation(quotationPayload);

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Failed to create quotation.";
    return { message: errorMessage };
  }

  revalidatePath("/quotations");
  revalidatePath("/dashboard");
  redirect("/quotations");
}

export async function updateQuotationAction(id: string, prevState: any, formData: FormData) {
 const rawData = Object.fromEntries(formData.entries());
  const items: ProductItem[] = [];
  for (let i = 0; ; i++) {
    const itemNameKey = `items.${i}.name`; // Changed to dot notation
    if (!Object.prototype.hasOwnProperty.call(rawData, itemNameKey)) break;
    
    items.push({
      id: rawData[`items.${i}.id`]?.toString() || crypto.randomUUID(),
      hsn: rawData[`items.${i}.hsn`]?.toString() || '',
      name: rawData[itemNameKey]?.toString() || '',
      description: rawData[`items.${i}.description`]?.toString() || '',
      imageUrl: rawData[`items.${i}.imageUrl`]?.toString() || '',
      quantity: parseFloat(rawData[`items.${i}.quantity`]?.toString() || '0'),
      unitType: rawData[`items.${i}.unitType`]?.toString() || '',
      unitPrice: parseFloat(rawData[`items.${i}.unitPrice`]?.toString() || '0'),
    });
  }
  
  const dataToValidate = {
    companyId: rawData.companyId as string,
    date: rawData.date ? new Date(rawData.date as string) : undefined, // Handle potentially missing date robustly for validation
    items: items,
    status: rawData.status as Quotation['status'],
  };
  
  const validatedFields = quotationSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.log("Validation Errors (Update):", JSON.stringify(validatedFields.error.flatten(), null, 2));
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed for quotation update.",
    };
  }

  try {
    const quotationPayload: Partial<Omit<Quotation, "id" | "quotationNumber" | "createdAt" | "companyName" | "companyEmail">> = {
        ...validatedFields.data,
    };
    await mockApi.updateQuotation(id, quotationPayload);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Failed to update quotation.";
    return { message: errorMessage };
  }

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${id}/edit`);
  revalidatePath(`/quotations/${id}/view`);
  revalidatePath("/dashboard");
  redirect("/quotations");
}

export async function deleteQuotationAction(id: string) {
  try {
    await mockApi.deleteQuotation(id);
    revalidatePath("/quotations");
    revalidatePath("/dashboard");
    return { message: "Quotation deleted successfully." };
  } catch (e) {
    return { message: "Failed to delete quotation." };
  }
}

export async function toggleQuotationStatusAction(quotationId: string, currentStatus: Quotation['status']): Promise<{ message: string; error?: boolean }> {
  if (currentStatus !== 'draft' && currentStatus !== 'sent') {
    return { message: "Status can only be toggled if it is 'draft' or 'sent'.", error: true };
  }

  const newStatus = currentStatus === 'draft' ? 'sent' : 'draft';

  try {
    await mockApi.updateQuotation(quotationId, { status: newStatus });
    revalidatePath("/quotations");
    revalidatePath("/dashboard"); // Added for dashboard stats
    return { message: `Quotation status updated to ${newStatus}.` };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Failed to update quotation status.";
    return { message: errorMessage, error: true };
  }
}


// My Company Settings Action
export async function updateMyCompanySettingsAction(prevState: any, formData: FormData) {
  const validatedFields = myCompanySettingsSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed for company settings.",
    };
  }

  try {
    await mockApi.updateMyCompanySettings(validatedFields.data);
  } catch (e) {
    return { message: "Failed to update company settings." };
  }

  revalidatePath("/settings");
  revalidatePath("/quotations", "layout"); 
  return { message: "Company settings updated successfully." };
}
