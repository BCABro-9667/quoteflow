
export interface Company {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  gstin: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductItem {
  id: string;
  hsn: string;
  name: string;
  description?: string;
  imageUrl?: string; // Optional
  quantity: number;
  unitPrice: number;
  // totalPrice will be calculated: quantity * unitPrice
}

export interface Quotation {
  id: string;
  quotationNumber: string; // Should be auto-generated or follow a pattern
  companyId: string; // Foreign key to Company
  companyName?: string; // Denormalized for display, populated on fetch
  date: Date;
  validUntil?: Date;
  items: ProductItem[];
  // subTotal, taxAmount, grandTotal will be calculated
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
};

export type NavItemGroup = {
  title?: string;
  items: NavItem[];
};

export interface MyCompanySettings {
  id: string; // Should be a singleton, e.g., "my-company-settings"
  name: string;
  address: string;
  email: string;
  phone: string;
  logoUrl: string;
}
