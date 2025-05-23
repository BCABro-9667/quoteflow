
import mongoose, { Schema, Document } from 'mongoose';
import type { ProductItem as ProductItemType } from '@/types';

// Note: ProductItem will be a subdocument, so it doesn't need its own model typically
// but defining the schema is useful for embedding.

export interface ProductItemDocument extends Omit<ProductItemType, 'id'>, Document {
  _id: mongoose.Types.ObjectId; // Mongoose uses _id for subdocuments
}

export const ProductItemSchema: Schema<ProductItemDocument> = new Schema(
  {
    hsn: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    quantity: { type: Number, required: true },
    unitType: { type: String, default: '' },
    unitPrice: { type: Number, required: true },
  },
  {
    _id: true, // Ensure _id is created for subdocuments
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString(); // Add 'id' field based on '_id'
        delete ret._id; // Optionally remove '_id' if 'id' is preferred
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    }
  }
);

// If you want to ensure `id` is part of the type when converting from DB to API response
ProductItemSchema.virtual('id').get(function (this: ProductItemDocument) {
  return this._id.toHexString();
});

// No model export here as it's a sub-schema
