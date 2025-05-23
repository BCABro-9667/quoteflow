
export interface Company {
  id: string; // MongoDB _id as string
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
  id: string; // MongoDB _id for subdocument, as string
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
  id: string; // MongoDB _id as string
  quotationNumber: string; 
  companyId: string; // String representation of Company ObjectId
  companyName?: string; // Populated
  companyEmail?: string; // Populated
  date: Date;
  validUntil?: Date; 
  items: ProductItem[];
  notes?: string; 
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'archived';
  createdBy: string; 
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
  id: string;  // MongoDB _id as string
  name: string;
  address: string;
  email: string;
  phone: string;
  logoUrl: string;
  website?: string;
  quotationPrefix: string;
  quotationNextNumber: number;
}
