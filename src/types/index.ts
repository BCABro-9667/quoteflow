
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
  imageUrl?: string; 
  quantity: number;
  unitType?: string; // e.g., "SET", "PCS", "KG"
  unitPrice: number;
  // totalPrice will be calculated: quantity * unitPrice
}

export interface Quotation {
  id: string;
  quotationNumber: string; 
  companyId: string; 
  companyName?: string; 
  companyEmail?: string; 
  date: Date;
  validUntil?: Date; 
  items: ProductItem[];
  notes?: string; 
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'archived';
  createdBy: string; // Added field for the person who created the quotation
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
  id: string; 
  name: string;
  address: string;
  email: string;
  phone: string;
  logoUrl: string;
  quotationPrefix: string;
  quotationNextNumber: number;
}
