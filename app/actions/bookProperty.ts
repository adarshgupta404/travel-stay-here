"use server";

import Razorpay from "razorpay";
import { connectDB } from "../lib/mongodb";
import { Booking } from "../models/Bookings";
import { IProperty, Property } from "../models/Property";
import { ObjectId } from "mongodb";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

export async function bookProperty(
  propertyId: string,
  userId: string,
  checkIn: string,
  checkOut: string,
  email: string,
  name: string,
  phone: string,
  price: number,
  capacity: {
    adults: number;
    children: number;
    rooms: number;
  },
  notes: string
) {
  try {
    await connectDB();
    const property_id = new ObjectId(propertyId);
    const user_id = new ObjectId(userId);

    // Fetch the property details
    const property:IProperty | null = await Property.findById(property_id);

    if (!property) {
      return {
        success: false,
        message: "Property not found",
      };
    }

    // Check for existing booking conflicts (check for booked rooms during the requested dates)
    const existingBookings = await Booking.find({
      propertyId: property_id,
      $or: [
        { checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } },
      ],
      status: { $eq: "Confirmed" },
    });

    const bookedRooms = existingBookings.reduce(
      (acc, booking) => acc + booking.capacity.rooms,
      0
    );

    // Check if the requested rooms exceed the available rooms
    if (bookedRooms + capacity.rooms > property.maxRooms) {
      return {
        success: false,
        message: `Not enough rooms available. Only ${property.maxRooms - bookedRooms} rooms are available for the selected dates.`,
      };
    }

    // Check if the total guests exceed the max allowed guests for the requested rooms
    const totalGuests = capacity.adults + capacity.children;
    const maxCapacityPerRoom = property.maxGuests * capacity.rooms;

    if (totalGuests > maxCapacityPerRoom) {
      return {
        success: false,
        message: `The total number of guests exceeds the maximum allowed per room. Maximum allowed is ${maxCapacityPerRoom} guests for ${capacity.rooms} rooms.`,
      };
    }

    // Create a new booking (pending payment)
    const newBooking = await Booking.create({
      propertyId: property_id,
      userId: user_id,
      checkIn,
      checkOut,
      email,
      name,
      status: "Pending",
      phone,
      totalPrice: price,
      capacity,
      notes,
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
