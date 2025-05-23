
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Company as CompanyType } from '@/types';

export interface CompanyDocument extends Omit<CompanyType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema<CompanyDocument> = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    gstin: { type: String, default: '' },
  },
  {
    timestamps: true, // Handles createdAt and updatedAt automatically
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    }
  }
);

CompanySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const CompanyModel = (models && models.Company as Model<CompanyDocument>) || mongoose.model<CompanyDocument>('Company', CompanySchema);
export default CompanyModel;
