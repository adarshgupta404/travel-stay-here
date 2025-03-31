import mongoose, { Schema } from "mongoose";

export interface IProperty {
  _id: string;
  name: string;
  slug: string;
  price: number;
  location: string;
  description: string;
  images: string[];
  type: string;
  rating: number;
  reviews: number;
  discount: number;
  available: boolean;
  maxGuests: number;
  maxRooms: number;
  amenities: string[];
  host: {
    name: string;
    contact: string;
  };
  policies: {
    cancellation: string;
    checkInTime: string;
    checkOutTime: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true },
    reviews: { type: Number, required: true },
    discount: { type: Number, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    available: { type: Boolean, required: true, default: true },
    maxGuests: { type: Number, required: true },
    maxRooms: { type: Number, required: true },
    amenities: { type: [String], default: [] },
    host: {
      name: { type: String, required: true },
      contact: { type: String, required: true },
    },
    policies: {
      cancellation: { type: String, default: "Flexible" },
      checkInTime: { type: String, default: "3:00 PM" },
      checkOutTime: { type: String, default: "11:00 AM" },
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Property =
  mongoose.models.Property ||
  mongoose.model<IProperty>("Property", PropertySchema);
