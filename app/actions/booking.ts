"use server";

import { connectDB } from "@/app/lib/mongodb";
import { Booking, IBooking } from "../models/Bookings";
import { Property } from "@/app/models/Property";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { convertToPlainObject } from "@/lib/objectConvert";


export async function getUserBookings(userId: string) {
  try {
    await connectDB();
    const user_id = new Types.ObjectId(userId);
    console.log(user_id);
    // In a real app, you would filter by the current user
    const bookings = await Booking.find({ userId: user_id })
      .sort({
        createdAt: -1,
      })
      .lean();
    console.log("Booking: ", bookings[0]);
    // Get property names for each booking
    const bookingsWithPropertyNames = await Promise.all(
      bookings.map(async (booking) => {
        const property = await Property.findById(booking.propertyId)
          .select("name")
          .lean();
        return {
          ...booking,
          propertyId: booking.propertyId.toString(),
          userId: booking.userId.toString(),
          property,
        };
      })
    );
    // console.log(convertToPlainObject(bookingsWithPropertyNames));
    return convertToPlainObject(bookingsWithPropertyNames);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function getRecentBookings(limit = 5) {
  try {
    await connectDB();

    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(limit);

    // Get property names for each booking
    const bookingsWithPropertyNames = await Promise.all(
      bookings.map(async (booking) => {
        const property = await Property.findById(booking.propertyId);
        return {
          ...booking.toObject(),
          _id: booking._id.toString(),
          propertyName: property ? property.name : "Unknown Property",
        };
      })
    );

    return convertToPlainObject(bookingsWithPropertyNames);
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    return [];
  }
}

export async function createBooking(bookingData: any) {
  try {
    await connectDB();

    const newBooking = new Booking(bookingData);
    await newBooking.save();

    revalidatePath("/dashboard/bookings");

    return { success: true, data: convertToPlainObject(newBooking) };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, message: "Failed to create booking" };
  }
}

export async function updateBookingStatus(id: string, status: string) {
  try {
    await connectDB();

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return { success: false, message: "Booking not found" };
    }

    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${id}`);

    return { success: true, data: convertToPlainObject(updatedBooking) };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, message: "Failed to update booking status" };
  }
}
