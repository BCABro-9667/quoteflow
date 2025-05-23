
import { z } from "zod";

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
export const productItemSchema = z.object({
  id: z.string().optional(), // Optional for new items
  hsn: z.string().min(1, "HSN code is required"),
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")), // Kept in schema for data integrity, removed from form UI for item entry
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitType: z.string().optional(), // E.g., "SET", "PCS"
  unitPrice: z.coerce.number().min(0.01, "Unit price must be positive"),
});

export const quotationSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  date: z.coerce.date(),
  // validUntil: z.coerce.date().optional(), // Removed from create form
  items: z.array(productItemSchema).min(1, "At least one product item is required"),
  // notes: z.string().optional(), // Removed from create form
  status: z.enum(["draft", "sent", "accepted", "rejected", "archived"]), // Will be defaulted in form, not shown as input
});

// My Company Settings Schema
export const myCompanySettingsSchema = z.object({
  name: z.string().min(2, "Your company name must be at least 2 characters"),
  address: z.string().min(5, "Your company address is required"),
  email: z.string().email("Invalid email address for your company"),
  phone: z.string().min(10, "Your company phone number must be at least 10 digits"),
  logoUrl: z.string().url("Invalid URL for logo. Please provide a valid image URL.").or(z.literal("")),
  quotationPrefix: z.string().max(50, "Prefix should be 50 characters or less.").optional().or(z.literal("")), // Allow empty for just numbers
  quotationNextNumber: z.coerce.number().int().positive("Next number must be a positive integer.").min(1, "Next number must be at least 1."),
});
