import mongoose, { Schema, Document } from "mongoose";

export interface IBooking {
  propertyId: mongoose.Schema.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  email: string;
  name: string;
  phone: string;
  status: string;
  paymentId: string;
  orderId: string;
  capacity: {
    adults: number;
    children: number;
    rooms: number;
  };
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, default: "Pending" },
    paymentId: { type: String, default: "" },
    orderId: { type: String, default: "" },
    capacity: {
      adults: { type: Number, required: true },
      children: { type: Number, required: true },
      rooms: { type: Number, required: true },
    },
    totalPrice: { type: Number, required: true },
    notes: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
