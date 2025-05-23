
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Company, Quotation, ProductItem } from "@/types";
import * as mockApi from "./mock-data"; // Using mock API
import { companySchema, companyUpdateSchema, quotationSchema, myCompanySettingsSchema } from "./schemas";

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
  const rawData = Object.fromEntries(formData.entries());
  const items: ProductItem[] = [];
  for (let i = 0; ; i++) {
    const itemNameKey = `items[${i}].name`;
    if (!Object.prototype.hasOwnProperty.call(rawData, itemNameKey)) break;
    
    items.push({
      id: rawData[`items[${i}].id`]?.toString() || crypto.randomUUID(),
      hsn: rawData[`items[${i}].hsn`]?.toString() || '',
      name: rawData[itemNameKey]?.toString() || '',
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
      message: "Validation failed for quotation.",
    };
  }
  
  try {
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
    const itemNameKey = `items[${i}].name`;
    if (!Object.prototype.hasOwnProperty.call(rawData, itemNameKey)) break;
    
    items.push({
      id: rawData[`items[${i}].id`]?.toString() || crypto.randomUUID(),
      hsn: rawData[`items[${i}].hsn`]?.toString() || '',
      name: rawData[itemNameKey]?.toString() || '',
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
      message: "Validation failed for quotation update.",
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
  revalidatePath("/quotations", "layout"); // Revalidate quotation views that might use this data
  // No redirect, stay on settings page
  return { message: "Company settings updated successfully." };
}
