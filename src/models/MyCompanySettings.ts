
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { MyCompanySettings as MyCompanySettingsType } from '@/types';

// MyCompanySettings is typically a single document or a collection with one document.
// We can use a fixed ID or a query to always get the first one.

export interface MyCompanySettingsDocument extends Omit<MyCompanySettingsType, 'id'>, Document {}

const MyCompanySettingsSchema: Schema<MyCompanySettingsDocument> = new Schema(
  {
    // We can use a fixed _id for this singleton document if desired,
    // or just query for the first document.
    // For simplicity, we won't enforce a specific _id here and will use findOneAndUpdate.
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    website: { type: String, default: '' },
    quotationPrefix: { type: String, default: 'QTN-' },
    quotationNextNumber: { type: Number, default: 1 },
  },
  {
    timestamps: false, // No createdAt/updatedAt for this singleton settings doc usually
    toJSON: {
      virtuals: true, // Ensure virtuals are included if any
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

MyCompanySettingsSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const MyCompanySettingsModel = models.MyCompanySettings as Model<MyCompanySettingsDocument> || mongoose.model<MyCompanySettingsDocument>('MyCompanySettings', MyCompanySettingsSchema);
export default MyCompanySettingsModel;
