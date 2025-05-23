
// This file is no longer used as data persistence has moved to src/lib/database.ts
// It is kept here to avoid breaking imports if any were missed, but should ideally be deleted.

import type { Company, Quotation, ProductItem, MyCompanySettings } from "@/types";

export const mockCompanies: Company[] = [];
export const mockQuotations: Quotation[] = [];
export const mockProductItems: ProductItem[] = [];
export let myCompanySettingsStore: MyCompanySettings = {
  id: "my-company-settings",
  name: "Default Company",
  address: "123 Default St",
  email: "default@example.com",
  phone: "555-0100",
  logoUrl: "",
  website: "",
  quotationPrefix: "QTN-",
  quotationNextNumber: 1,
};

// Empty functions to prevent errors if still called by old code paths.
export const getCompanies = async (): Promise<Company[]> => { console.warn("Mock getCompanies called"); return []; };
export const getCompanyById = async (id: string): Promise<Company | undefined> => { console.warn("Mock getCompanyById called"); return undefined; };
export const addCompany = async (companyData: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company> => { console.warn("Mock addCompany called"); throw new Error("Mock addCompany not implemented"); };
export const updateCompany = async (id: string, updates: Partial<Omit<Company, "id" | "createdAt">>): Promise<Company | null> => { console.warn("Mock updateCompany called"); return null; };
export const deleteCompany = async (id: string): Promise<boolean> => { console.warn("Mock deleteCompany called"); return false; };
export const getQuotations = async (): Promise<Quotation[]> => { console.warn("Mock getQuotations called"); return []; };
export const getQuotationById = async (id: string): Promise<Quotation | undefined> => { console.warn("Mock getQuotationById called"); return undefined; };
export const addQuotation = async (quotationData: Omit<Quotation, "id" | "createdAt" | "updatedAt" | "companyName" | "companyEmail">): Promise<Quotation> => { console.warn("Mock addQuotation called"); throw new Error("Mock addQuotation not implemented"); };
export const updateQuotation = async (id: string, updates: Partial<Omit<Quotation, "id" | "createdAt" | "companyName" | "companyEmail">>): Promise<Quotation | null> => { console.warn("Mock updateQuotation called"); return null; };
export const deleteQuotation = async (id: string): Promise<boolean> => { console.warn("Mock deleteQuotation called"); return false; };
export const getMyCompanySettings = async (): Promise<MyCompanySettings> => { console.warn("Mock getMyCompanySettings called"); return myCompanySettingsStore; };
export const updateMyCompanySettings = async (updates: Partial<Omit<MyCompanySettings, "id">>): Promise<MyCompanySettings> => { console.warn("Mock updateMyCompanySettings called"); myCompanySettingsStore = {...myCompanySettingsStore, ...updates}; return myCompanySettingsStore; };
