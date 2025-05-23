
import connectDB from './mongodb';
import CompanyModel from '@/models/Company';
import QuotationModel from '@/models/Quotation';
import MyCompanySettingsModel from '@/models/MyCompanySettings';
import type { Company, Quotation, ProductItem, MyCompanySettings } from '@/types';
import mongoose from 'mongoose';

// Helper to convert DB doc to client-facing type
const toCompany = (doc: any): Company => {
  const obj = doc.toObject(); // Applies schema's toObject transform
  return {
    ...obj, // Spreads properties from the transformed object, including 'id'
    // id: obj.id, // 'id' is already part of 'obj' due to the transform in CompanySchema
    createdAt: new Date(obj.createdAt), // Ensure Date type
    updatedAt: new Date(obj.updatedAt), // Ensure Date type
  } as Company; // Cast to Company type
};

const toQuotation = (doc: any): Quotation => {
  const obj = doc.toObject(); // Applies schema's toObject transform (for Quotation and its items)
  return {
    ...obj, // Spreads properties, including 'id' for quotation and transformed 'items'
    companyId: obj.companyId.toString(), // Ensure companyId (ObjectId) is converted to string
    date: new Date(obj.date), // Ensure Date type
    validUntil: obj.validUntil ? new Date(obj.validUntil) : undefined, // Ensure Date type or undefined
    createdAt: new Date(obj.createdAt), // Ensure Date type
    updatedAt: new Date(obj.updatedAt), // Ensure Date type
  } as Quotation; // Cast to Quotation type
};

const toMyCompanySettings = (doc: any): MyCompanySettings => {
   const obj = doc.toObject(); // Applies schema's toObject transform
  return {
    ...obj, // Spreads properties from the transformed object, including 'id'
    // id: obj.id, // 'id' is already part of 'obj' due to the transform
  } as MyCompanySettings; // Cast to MyCompanySettings type
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
  const quotationsDocs = await QuotationModel.find({})
    .populate<{ companyId: { _id: mongoose.Types.ObjectId, name: string, contactEmail: string } }>({
      path: 'companyId',
      select: 'name contactEmail' // Select fields for population
    })
    .sort({ date: -1 });

  return quotationsDocs.map(doc => {
    const quotation = toQuotation(doc);
    // The virtuals 'companyName' and 'companyEmail' in QuotationSchema should handle populating these.
    // If direct population results need to be mapped:
    if (doc.companyId && typeof doc.companyId === 'object' && 'name' in doc.companyId) {
        quotation.companyName = (doc.companyId as any).name;
        quotation.companyEmail = (doc.companyId as any).contactEmail;
    }
    return quotation;
  });
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const quotationDoc = await QuotationModel.findById(id)
    .populate<{ companyId: { _id: mongoose.Types.ObjectId, name: string, contactEmail: string } }>({
      path: 'companyId',
      select: 'name contactEmail' // Select fields for population
    });

  if (!quotationDoc) return null;
  
  const quotation = toQuotation(quotationDoc);
  // The virtuals 'companyName' and 'companyEmail' in QuotationSchema should handle populating these.
  // If direct population results need to be mapped:
    if (quotationDoc.companyId && typeof quotationDoc.companyId === 'object' && 'name' in quotationDoc.companyId) {
        quotation.companyName = (quotationDoc.companyId as any).name;
        quotation.companyEmail = (quotationDoc.companyId as any).contactEmail;
    }
  return quotation;
}

export async function addQuotation(
  quotationData: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'companyName' | 'companyEmail'>
): Promise<Quotation> {
  await connectDB();

  const company = await CompanyModel.findById(quotationData.companyId);
  if (!company) throw new Error("Company not found for quotation.");

  const settings = await getMyCompanySettings();
  let finalQuotationNumber = quotationData.quotationNumber;

  // Check if this quotation number is the one that would auto-increment the settings
  if (quotationData.quotationNumber === `${settings.quotationPrefix}${String(settings.quotationNextNumber).padStart(3, '0')}`) {
      // Increment next number in settings ONLY if the submitted number matches the expected next number
      await MyCompanySettingsModel.findOneAndUpdate({}, { $inc: { quotationNextNumber: 1 } }, { new: true, upsert: true });
  }
  
  const itemsWithMongoIds = quotationData.items.map(item => ({
    ...item,
    _id: item.id && mongoose.Types.ObjectId.isValid(item.id) ? new mongoose.Types.ObjectId(item.id) : new mongoose.Types.ObjectId()
  }));

  const newQuotationData = {
    ...quotationData,
    quotationNumber: finalQuotationNumber,
    companyId: new mongoose.Types.ObjectId(quotationData.companyId),
    items: itemsWithMongoIds,
  };

  const newQuotationDoc = new QuotationModel(newQuotationData);
  await newQuotationDoc.save();
  
  // Re-fetch to ensure population and transforms are applied consistently
  const savedQuotation = await getQuotationById(newQuotationDoc._id.toString());
  if (!savedQuotation) throw new Error("Failed to retrieve saved quotation after creation.");
  return savedQuotation;
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
      _id: item.id && mongoose.Types.ObjectId.isValid(item.id) ? new mongoose.Types.ObjectId(item.id) : (item._id || new mongoose.Types.ObjectId())
    }));
  }
  
  await QuotationModel.findByIdAndUpdate(id, updateData, { new: true });
  
  // Re-fetch to ensure population and transforms are applied consistently
  const updatedQuotation = await getQuotationById(id);
  return updatedQuotation;
}

export async function deleteQuotation(id: string): Promise<boolean> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await QuotationModel.findByIdAndDelete(id);
  return !!result;
}

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
  let settingsDoc = await MyCompanySettingsModel.findOne({});
  if (!settingsDoc) {
    settingsDoc = await MyCompanySettingsModel.create(defaultMyCompanySettings);
  }
  return toMyCompanySettings(settingsDoc);
}

export async function updateMyCompanySettings(updates: Partial<Omit<MyCompanySettings, 'id'>>): Promise<MyCompanySettings> {
  await connectDB();
  const updatedSettingsDoc = await MyCompanySettingsModel.findOneAndUpdate({}, updates, { new: true, upsert: true });
  if (!updatedSettingsDoc) {
      throw new Error("Failed to update or create company settings");
  }
  return toMyCompanySettings(updatedSettingsDoc);
}
    