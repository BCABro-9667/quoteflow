
import connectDB from './mongodb';
import CompanyModel from '@/models/Company';
import QuotationModel from '@/models/Quotation';
import MyCompanySettingsModel from '@/models/MyCompanySettings';
import type { Company, Quotation, ProductItem, MyCompanySettings } from '@/types';
import mongoose from 'mongoose';

// Helper to convert DB doc to client-facing type
const toCompany = (doc: any): Company => {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id.toString(),
    createdAt: new Date(obj.createdAt),
    updatedAt: new Date(obj.updatedAt),
  };
};

const toQuotation = (doc: any): Quotation => {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id.toString(),
    companyId: obj.companyId.toString(),
    items: obj.items.map((item: any) => ({
      ...item,
      id: item._id ? item._id.toString() : item.id, // Handle if _id exists
    })),
    date: new Date(obj.date),
    validUntil: obj.validUntil ? new Date(obj.validUntil) : undefined,
    createdAt: new Date(obj.createdAt),
    updatedAt: new Date(obj.updatedAt),
  };
};

const toMyCompanySettings = (doc: any): MyCompanySettings => {
   const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id.toString(),
  };
};


export async function getCompanies(): Promise<Company[]> {
  await connectDB();
  const companies = await CompanyModel.find({}).sort({ createdAt: -1 });
  return companies.map(toCompany);
}

export async function getCompanyById(id: string): Promise<Company | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const company = await CompanyModel.findById(id);
  return company ? toCompany(company) : null;
}

export async function addCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
  await connectDB();
  const newCompany = new CompanyModel(companyData);
  await newCompany.save();
  return toCompany(newCompany);
}

export async function updateCompany(id: string, updates: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Company | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const updatedCompany = await CompanyModel.findByIdAndUpdate(id, updates, { new: true });
  return updatedCompany ? toCompany(updatedCompany) : null;
}

export async function deleteCompany(id: string): Promise<boolean> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  
  // Also delete related quotations
  await QuotationModel.deleteMany({ companyId: new mongoose.Types.ObjectId(id) });
  
  const result = await CompanyModel.findByIdAndDelete(id);
  return !!result;
}

export async function getQuotations(): Promise<Quotation[]> {
  await connectDB();
  const quotations = await QuotationModel.find({})
    .populate<{ companyId: { _id: mongoose.Types.ObjectId, name: string, contactEmail: string } }>({
      path: 'companyId',
      select: 'name contactEmail'
    })
    .sort({ date: -1 });

  return quotations.map(q => {
    const populatedQuotation = q.toObject({ virtuals: true }) as any; // Use 'any' for simplicity here
    return {
      ...populatedQuotation,
      id: populatedQuotation._id.toString(),
      companyId: populatedQuotation.companyId._id.toString(),
      companyName: populatedQuotation.companyId.name,
      companyEmail: populatedQuotation.companyId.contactEmail,
      items: populatedQuotation.items.map((item: any) => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
      })),
      date: new Date(populatedQuotation.date),
      validUntil: populatedQuotation.validUntil ? new Date(populatedQuotation.validUntil) : undefined,
      createdAt: new Date(populatedQuotation.createdAt),
      updatedAt: new Date(populatedQuotation.updatedAt),
    };
  });
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const quotation = await QuotationModel.findById(id)
    .populate<{ companyId: { _id: mongoose.Types.ObjectId, name: string, contactEmail: string } }>({
      path: 'companyId',
      select: 'name contactEmail'
    });

  if (!quotation) return null;
  
  const populatedQuotation = quotation.toObject({ virtuals: true }) as any;
  return {
      ...populatedQuotation,
      id: populatedQuotation._id.toString(),
      companyId: populatedQuotation.companyId._id.toString(),
      companyName: populatedQuotation.companyId.name,
      companyEmail: populatedQuotation.companyId.contactEmail,
      items: populatedQuotation.items.map((item: any) => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
      })),
      date: new Date(populatedQuotation.date),
      validUntil: populatedQuotation.validUntil ? new Date(populatedQuotation.validUntil) : undefined,
      createdAt: new Date(populatedQuotation.createdAt),
      updatedAt: new Date(populatedQuotation.updatedAt),
  };
}

export async function addQuotation(
  quotationData: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'companyName' | 'companyEmail'>
): Promise<Quotation> {
  await connectDB();

  const company = await CompanyModel.findById(quotationData.companyId);
  if (!company) throw new Error("Company not found for quotation.");

  const settings = await getMyCompanySettings();
  let finalQuotationNumber = quotationData.quotationNumber;

  if (!finalQuotationNumber || finalQuotationNumber === `${settings.quotationPrefix}${String(settings.quotationNextNumber).padStart(3, '0')}`) {
      finalQuotationNumber = `${settings.quotationPrefix}${String(settings.quotationNextNumber).padStart(3, '0')}`;
      // Increment next number in settings
      await MyCompanySettingsModel.findOneAndUpdate({}, { $inc: { quotationNextNumber: 1 } }, { new: true, upsert: true });
  }
  
  // Ensure product item IDs are ObjectIds or handle client-generated string IDs
  const itemsWithMongoIds = quotationData.items.map(item => ({
    ...item,
    _id: item.id && mongoose.Types.ObjectId.isValid(item.id) ? new mongoose.Types.ObjectId(item.id) : new mongoose.Types.ObjectId() // Generate new if invalid/missing
  }));


  const newQuotationData = {
    ...quotationData,
    quotationNumber: finalQuotationNumber,
    companyId: new mongoose.Types.ObjectId(quotationData.companyId),
    items: itemsWithMongoIds,
  };

  const newQuotation = new QuotationModel(newQuotationData);
  await newQuotation.save();
  
  // Repopulate for return
  const savedQuotation = await QuotationModel.findById(newQuotation._id)
    .populate<{ companyId: { _id: mongoose.Types.ObjectId, name: string, contactEmail: string } }>({
      path: 'companyId',
      select: 'name contactEmail'
    });
  
  if (!savedQuotation) throw new Error("Failed to retrieve saved quotation");
  
  const populatedQuotation = savedQuotation.toObject({ virtuals: true }) as any;
  return {
      ...populatedQuotation,
      id: populatedQuotation._id.toString(),
      companyId: populatedQuotation.companyId._id.toString(),
      companyName: populatedQuotation.companyId.name,
      companyEmail: populatedQuotation.companyId.contactEmail,
      items: populatedQuotation.items.map((item: any) => ({
        ...item,
        id: item._id.toString(),
      })),
      date: new Date(populatedQuotation.date),
      validUntil: populatedQuotation.validUntil ? new Date(populatedQuotation.validUntil) : undefined,
      createdAt: new Date(populatedQuotation.createdAt),
      updatedAt: new Date(populatedQuotation.updatedAt),
  };
}

export async function updateQuotation(
  id: string,
  updates: Partial<Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'companyName' | 'companyEmail'>>
): Promise<Quotation | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const updateData: any = { ...updates };
  if (updates.companyId) {
    updateData.companyId = new mongoose.Types.ObjectId(updates.companyId);
  }
  if (updates.items) {
    updateData.items = updates.items.map(item => ({
      ...item,
       // Ensure _id is ObjectId or generate new if it's a new subdocument
      _id: item.id && mongoose.Types.ObjectId.isValid(item.id) ? new mongoose.Types.ObjectId(item.id) : (item._id || new mongoose.Types.ObjectId())
    }));
  }
  
  const updatedQuotation = await QuotationModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate<{ companyId: { _id: mongoose.Types.ObjectId, name: string, contactEmail: string } }>({
      path: 'companyId',
      select: 'name contactEmail'
    });

  if (!updatedQuotation) return null;
  
  const populatedQuotation = updatedQuotation.toObject({ virtuals: true }) as any;
   return {
      ...populatedQuotation,
      id: populatedQuotation._id.toString(),
      companyId: populatedQuotation.companyId._id.toString(),
      companyName: populatedQuotation.companyId.name,
      companyEmail: populatedQuotation.companyId.contactEmail,
      items: populatedQuotation.items.map((item: any) => ({
        ...item,
        id: item._id.toString(),
      })),
      date: new Date(populatedQuotation.date),
      validUntil: populatedQuotation.validUntil ? new Date(populatedQuotation.validUntil) : undefined,
      createdAt: new Date(populatedQuotation.createdAt),
      updatedAt: new Date(populatedQuotation.updatedAt),
  };
}

export async function deleteQuotation(id: string): Promise<boolean> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await QuotationModel.findByIdAndDelete(id);
  return !!result;
}


// MyCompanySettings is a singleton. We use findOneAndUpdate with upsert.
// A known ID or a specific query field could be used if there were multiple setting profiles.
// For this app, we assume one global settings document.
const defaultMyCompanySettings: Omit<MyCompanySettings, 'id'> = {
  name: "QuoteFlow Solutions",
  address: "456 App Business Park, Suite 100, Tech City, TX 75001",
  email: "support@quoteflow.example.com",
  phone: "+1-800-555-FLOW",
  logoUrl: "https://placehold.co/150x50.png?text=QuoteFlow",
  website: "https://example.com",
  quotationPrefix: "QTN-",
  quotationNextNumber: 1,
};

export async function getMyCompanySettings(): Promise<MyCompanySettings> {
  await connectDB();
  let settings = await MyCompanySettingsModel.findOne({});
  if (!settings) {
    settings = await MyCompanySettingsModel.create(defaultMyCompanySettings);
  }
  return toMyCompanySettings(settings);
}

export async function updateMyCompanySettings(updates: Partial<Omit<MyCompanySettings, 'id'>>): Promise<MyCompanySettings> {
  await connectDB();
  const updatedSettings = await MyCompanySettingsModel.findOneAndUpdate({}, updates, { new: true, upsert: true });
  if (!updatedSettings) { // Should not happen with upsert: true if DB is connected
      throw new Error("Failed to update or create company settings");
  }
  return toMyCompanySettings(updatedSettings);
}

