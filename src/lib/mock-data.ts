
import type { Company, Quotation, ProductItem, MyCompanySettings } from "@/types";

export const mockCompanies: Company[] = [
  {
    id: "comp_1",
    name: "Innovatech Solutions Ltd.",
    address: "123 Tech Park, Silicon Valley, CA 94000",
    contactPerson: "Alice Wonderland",
    contactEmail: "alice@innovatech.com",
    contactPhone: "+1-555-0100",
    gstin: "27ABCDE1234F1Z5",
    createdAt: new Date("2023-01-15T09:00:00Z"),
    updatedAt: new Date("2023-05-20T14:30:00Z"),
  },
  {
    id: "comp_2",
    name: "Eco Builders Inc.",
    address: "456 Green Avenue, Boulder, CO 80302",
    contactPerson: "Bob The Builder",
    contactEmail: "bob@ecobuilders.com",
    contactPhone: "+1-555-0101",
    gstin: "06FGHIJ5678K2L9",
    createdAt: new Date("2023-02-20T11:00:00Z"),
    updatedAt: new Date("2023-06-10T10:15:00Z"),
  },
  {
    id: "comp_3",
    name: "Quantum Leap Technologies",
    address: "789 Future Drive, Austin, TX 78701",
    contactPerson: "Charlie Brown",
    contactEmail: "charlie@quantumleap.tech",
    contactPhone: "+1-555-0102",
    gstin: "33KLMNO9012P3Q7",
    createdAt: new Date("2023-03-10T16:30:00Z"),
    updatedAt: new Date("2023-07-01T09:00:00Z"),
  },
];

const mockProductItems: ProductItem[] = [
  { id: "prod_1", hsn: "8471", name: "Laptop Pro 15\"", description: "High-performance laptop", quantity: 2, unitType: "PCS", unitPrice: 1200.00 },
  { id: "prod_2", hsn: "8517", name: "Smartphone X", description: "Latest generation smartphone", quantity: 5, unitType: "PCS", unitPrice: 800.00 },
  { id: "prod_3", hsn: "9006", name: "Digital Camera Z", description: "Professional DSLR camera", quantity: 1, unitType: "PCS", unitPrice: 1500.00 },
  { id: "prod_4", hsn: "8473", name: "Wireless Mouse", quantity: 10, unitType: "PCS", unitPrice: 25.00 },
  { id: "prod_5", hsn: "8518", name: "Bluetooth Headphones", quantity: 3, unitType: "SET", unitPrice: 150.00 },
];

export let mockQuotations: Quotation[] = [
  {
    id: "quot_1",
    quotationNumber: "QTN-2023-001",
    companyId: "comp_1",
    companyEmail: "alice@innovatech.com",
    companyName: "Innovatech Solutions Ltd.",
    date: new Date("2023-06-01T10:00:00Z"),
    validUntil: new Date("2023-07-01T10:00:00Z"),
    items: [mockProductItems[0], mockProductItems[3]],
    status: "sent",
    notes: "Includes 2 year extended warranty. Payment terms: Net 30.",
    createdBy: "Alice Wonderland",
    createdAt: new Date("2023-06-01T10:00:00Z"),
    updatedAt: new Date("2023-06-02T11:00:00Z"),
  },
  {
    id: "quot_2",
    quotationNumber: "QTN-2023-002",
    companyId: "comp_2",
    companyEmail: "bob@ecobuilders.com",
    companyName: "Eco Builders Inc.",
    date: new Date("2023-06-15T14:00:00Z"),
    validUntil: new Date("2023-07-15T14:00:00Z"),
    items: [mockProductItems[1], mockProductItems[4]],
    status: "draft",
    notes: "Requires 50% advance payment. Delivery within 2 weeks.",
    createdBy: "Bob The Builder",
    createdAt: new Date("2023-06-15T14:00:00Z"),
    updatedAt: new Date("2023-06-15T14:00:00Z"),
  },
  {
    id: "quot_3",
    quotationNumber: "QTN-2023-003",
    companyId: "comp_1",
    companyEmail: "alice@innovatech.com",
    companyName: "Innovatech Solutions Ltd.",
    date: new Date("2023-07-01T09:30:00Z"),
    validUntil: new Date("2023-08-01T09:30:00Z"),
    items: [mockProductItems[2]],
    status: "accepted",
    notes: "Special discount applied.",
    createdBy: "System Admin",
    createdAt: new Date("2023-07-01T09:30:00Z"),
    updatedAt: new Date("2023-07-05T10:00:00Z"),
  },
];

// Helper functions to simulate a backend store
let companiesStore = [...mockCompanies];
let quotationsStore = [...mockQuotations];

// My Company Settings Store
let myCompanySettingsStore: MyCompanySettings = {
  id: "my-company-settings",
  name: "QuoteFlow Solutions",
  address: "456 App Business Park, Suite 100, Tech City, TX 75001",
  email: "support@quoteflow.example.com",
  phone: "+1-800-555-FLOW",
  logoUrl: "https://placehold.co/150x50.png?text=QuoteFlow",
  quotationPrefix: "QTN-",
  quotationNextNumber: mockQuotations.length + 4, // Initialized higher to avoid immediate conflict with existing
};

const populateCompanyDetails = (quotation: Quotation): Quotation => {
  const company = companiesStore.find(c => c.id === quotation.companyId);
  return {
    ...quotation,
    companyName: company?.name,
    companyEmail: company?.contactEmail,
  };
};

export const getMyCompanySettings = async (): Promise<MyCompanySettings> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(myCompanySettingsStore));
};

export const updateMyCompanySettings = async (updates: Partial<Omit<MyCompanySettings, "id">>): Promise<MyCompanySettings> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  myCompanySettingsStore = { ...myCompanySettingsStore, ...updates };
  return JSON.parse(JSON.stringify(myCompanySettingsStore));
};


export const getCompanies = async (): Promise<Company[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(companiesStore.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))));
};

export const getCompanyById = async (id: string): Promise<Company | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const company = companiesStore.find(c => c.id === id);
  if (company) {
    return JSON.parse(JSON.stringify({
      ...company,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    }));
  }
  return undefined;
};

export const addCompany = async (companyData: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newCompany: Company = {
    ...companyData,
    id: `comp_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  companiesStore.push(newCompany);
  return JSON.parse(JSON.stringify({
    ...newCompany,
    createdAt: newCompany.createdAt.toISOString(),
    updatedAt: newCompany.updatedAt.toISOString(),
  }));
};

export const updateCompany = async (id: string, updates: Partial<Omit<Company, "id" | "createdAt">>): Promise<Company | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const companyIndex = companiesStore.findIndex(c => c.id === id);
  if (companyIndex === -1) return null;
  companiesStore[companyIndex] = { ...companiesStore[companyIndex], ...updates, updatedAt: new Date() };
  
  quotationsStore = quotationsStore.map(q => {
    if (q.companyId === id) {
      const company = companiesStore[companyIndex];
      return { ...q, companyName: company.name, companyEmail: company.contactEmail };
    }
    return q;
  });
  
  return JSON.parse(JSON.stringify({
    ...companiesStore[companyIndex],
    createdAt: companiesStore[companyIndex].createdAt.toISOString(),
    updatedAt: companiesStore[companyIndex].updatedAt.toISOString(),
  }));
};

export const deleteCompany = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = companiesStore.length;
  companiesStore = companiesStore.filter(c => c.id !== id);
  quotationsStore = quotationsStore.filter(q => q.companyId !== id);
  return companiesStore.length < initialLength;
};


export const getQuotations = async (): Promise<Quotation[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(JSON.stringify(quotationsStore.map(q => {
    const populated = populateCompanyDetails(q);
    return {
      ...populated,
      date: populated.date.toISOString(),
      validUntil: populated.validUntil ? populated.validUntil.toISOString() : undefined,
      createdAt: populated.createdAt.toISOString(),
      updatedAt: populated.updatedAt.toISOString(),
    };
  })));
};

export const getQuotationById = async (id: string): Promise<Quotation | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const quotation = quotationsStore.find(q => q.id === id);
  if (quotation) {
    const populated = populateCompanyDetails(quotation);
    return JSON.parse(JSON.stringify({
      ...populated,
      date: populated.date.toISOString(),
      validUntil: populated.validUntil ? populated.validUntil.toISOString() : undefined,
      notes: populated.notes, 
      createdBy: populated.createdBy,
      createdAt: populated.createdAt.toISOString(),
      updatedAt: populated.updatedAt.toISOString(),
    }));
  }
  return undefined;
};

export const addQuotation = async (
  quotationData: Omit<Quotation, "id" | "createdAt" | "updatedAt" | "companyName" | "companyEmail">
): Promise<Quotation> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let newQuotation: Quotation = {
    ...quotationData, 
    id: `quot_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  newQuotation = populateCompanyDetails(newQuotation); 
  quotationsStore.push(newQuotation);

  const settings = await getMyCompanySettings();
  if (newQuotation.quotationNumber === `${settings.quotationPrefix}${String(settings.quotationNextNumber).padStart(3, '0')}`) {
    await updateMyCompanySettings({ quotationNextNumber: settings.quotationNextNumber + 1 });
  }
  
  return JSON.parse(JSON.stringify({
    ...newQuotation,
    date: newQuotation.date.toISOString(),
    validUntil: newQuotation.validUntil ? newQuotation.validUntil.toISOString() : undefined,
    createdAt: newQuotation.createdAt.toISOString(),
    updatedAt: newQuotation.updatedAt.toISOString(),
  }));
};

export const updateQuotation = async (
  id: string, 
  updates: Partial<Omit<Quotation, "id" | "createdAt" | "companyName" | "companyEmail">>
): Promise<Quotation | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const quotationIndex = quotationsStore.findIndex(q => q.id === id);
  if (quotationIndex === -1) return null;
  
  let updatedQuotationData: Quotation = { 
    ...quotationsStore[quotationIndex], 
    ...updates, 
    updatedAt: new Date(),
  };
  
  const company = companiesStore.find(c => c.id === updatedQuotationData.companyId);
  updatedQuotationData.companyName = company?.name;
  updatedQuotationData.companyEmail = company?.contactEmail;

  quotationsStore[quotationIndex] = updatedQuotationData;
  return JSON.parse(JSON.stringify({
    ...updatedQuotationData,
    date: updatedQuotationData.date.toISOString(),
    validUntil: updatedQuotationData.validUntil ? updatedQuotationData.validUntil.toISOString() : undefined,
    createdAt: updatedQuotationData.createdAt.toISOString(),
    updatedAt: updatedQuotationData.updatedAt.toISOString(),
  }));
};

export const deleteQuotation = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = quotationsStore.length;
  quotationsStore = quotationsStore.filter(q => q.id !== id);
  return quotationsStore.length < initialLength;
};
