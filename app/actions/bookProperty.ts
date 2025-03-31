"use server";

import Razorpay from "razorpay";
import { connectDB } from "../lib/mongodb";
import { Booking } from "../models/Bookings";
import { ObjectId } from "mongodb";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

export async function bookProperty(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  email: string,
  name: string,
  price: number
) {
  try {
    await connectDB();
    const property_id = new ObjectId(propertyId);

    // Check for existing booking
    const existingBooking = await Booking.findOne({
      propertyId: property_id,
      $or: [{ checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } }],
      status: { $eq: "Confirmed" },
    });

    if (existingBooking) {
      return {
        success: false,
        message: "Property is already booked for these dates",
      };
    }

    // Create a new booking (pending payment)
    const newBooking = await Booking.create({
      propertyId: property_id,
      checkIn,
      checkOut,
      email,
      name,
      status: "Pending",
    });

    // Create Razorpay Order
    const options = {
      amount: price * 100, // Razorpay requires the amount in paise
      currency: "INR",
      receipt: newBooking._id.toString(),
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);

    return {
      success: true,
      orderId: order.id,
      bookingId: newBooking._id.toString(),
      key: process.env.RAZORPAY_KEY!,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Booking failed" };
  }
}
