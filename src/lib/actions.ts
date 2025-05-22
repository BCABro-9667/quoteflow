"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Company, Quotation, ProductItem } from "@/types";
import * as mockApi from "./mock-data"; // Using mock API

// Company Schemas
const companySchemaBase = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format (e.g., 22AAAAA0000A1Z5)").optional().or(z.literal("")),
});

export const companySchema = companySchemaBase;
export const companyUpdateSchema = companySchemaBase.partial();


// Quotation Schemas
const productItemSchema = z.object({
  id: z.string().optional(), // Optional for new items
  hsn: z.string().min(1, "HSN code is required"),
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0.01, "Unit price must be positive"),
});

export const quotationSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  date: z.coerce.date(),
  validUntil: z.coerce.date().optional(),
  items: z.array(productItemSchema).min(1, "At least one product item is required"),
  notes: z.string().optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected", "archived"]),
});


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
export async function createQuotationAction(prevState: any, formData: FormData) {
  // FormData needs careful parsing for nested arrays like 'items'
  // This is a simplified parsing. Real implementation might need more robust logic or JSON submission.
  const rawData = Object.fromEntries(formData.entries());
  const items: ProductItem[] = [];
  for (let i = 0; ; i++) {
    if (!rawData[`items[${i}].name`]) break;
    items.push({
      id: rawData[`items[${i}].id`]?.toString() || crypto.randomUUID(),
      hsn: rawData[`items[${i}].hsn`]?.toString() || '',
      name: rawData[`items[${i}].name`]?.toString() || '',
      description: rawData[`items[${i}].description`]?.toString() || '',
      imageUrl: rawData[`items[${i}].imageUrl`]?.toString() || '',
      quantity: parseFloat(rawData[`items[${i}].quantity`]?.toString() || '0'),
      unitPrice: parseFloat(rawData[`items[${i}].unitPrice`]?.toString() || '0'),
    });
  }

  const dataToValidate = {
    companyId: rawData.companyId,
    date: rawData.date,
    validUntil: rawData.validUntil || undefined,
    items: items,
    notes: rawData.notes,
    status: rawData.status,
  };
  
  const validatedFields = quotationSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }
  
  try {
    // Ensure items have IDs if they are new
    const processedItems = validatedFields.data.items.map(item => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    }));

    await mockApi.addQuotation({ ...validatedFields.data, items: processedItems });
  } catch (e) {
    return { message: "Failed to create quotation." };
  }

  revalidatePath("/quotations");
  revalidatePath("/dashboard");
  redirect("/quotations");
}

export async function updateQuotationAction(id: string, prevState: any, formData: FormData) {
 const rawData = Object.fromEntries(formData.entries());
  const items: ProductItem[] = [];
  for (let i = 0; ; i++) {
    if (!rawData[`items[${i}].name`]) break;
    items.push({
      id: rawData[`items[${i}].id`]?.toString() || crypto.randomUUID(),
      hsn: rawData[`items[${i}].hsn`]?.toString() || '',
      name: rawData[`items[${i}].name`]?.toString() || '',
      description: rawData[`items[${i}].description`]?.toString() || '',
      imageUrl: rawData[`items[${i}].imageUrl`]?.toString() || '',
      quantity: parseFloat(rawData[`items[${i}].quantity`]?.toString() || '0'),
      unitPrice: parseFloat(rawData[`items[${i}].unitPrice`]?.toString() || '0'),
    });
  }
  
  const dataToValidate = {
    companyId: rawData.companyId,
    date: rawData.date,
    validUntil: rawData.validUntil || undefined,
    items: items,
    notes: rawData.notes,
    status: rawData.status,
  };

  const validatedFields = quotationSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  try {
    const processedItems = validatedFields.data.items.map(item => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    }));
    await mockApi.updateQuotation(id, { ...validatedFields.data, items: processedItems });
  } catch (e) {
    return { message: "Failed to update quotation." };
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
