
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { ProductItemSchema } from './ProductItem';
import type { Quotation as QuotationType } from '@/types';

export interface QuotationDocument extends Omit<QuotationType, 'id' | 'items' | 'companyId' | 'createdAt' | 'updatedAt'>, Document {
  companyId: mongoose.Types.ObjectId;
  items: ProductItemSchema[];
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema: Schema<QuotationDocument> = new Schema(
  {
    quotationNumber: { type: String, required: true, unique: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    date: { type: Date, required: true },
    validUntil: { type: Date },
    items: [ProductItemSchema],
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'archived'],
      required: true,
    },
    notes: { type: String, default: '' },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        // Ensure subdocument IDs are also transformed if needed
        if (ret.items) {
          ret.items = ret.items.map((item: any) => {
            if (item._id) {
              item.id = item._id.toString();
              delete item._id;
            }
            return item;
          });
        }
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        if (ret.items) {
          ret.items = ret.items.map((item: any) => {
            if (item._id) {
              item.id = item._id.toString();
              delete item._id;
            }
            return item;
          });
        }
      },
    }
  }
);

QuotationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Populate companyName and companyEmail
QuotationSchema.virtual('companyName', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name' }
});

QuotationSchema.virtual('companyEmail', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'contactEmail' }
});


const QuotationModel = models.Quotation as Model<QuotationDocument> || mongoose.model<QuotationDocument>('Quotation', QuotationSchema);
export default QuotationModel;
