"use server";

import { connectDB } from "../lib/mongodb";
import { Booking } from "../models/Bookings";
import { Property } from "../models/Property";
import { ObjectId } from "mongodb";
import moment from "moment";

export async function checkAvailability(
  propertyId: string,
  checkIn: string,
  checkOut: string
) {
  try {
    await connectDB();
    const property_id = new ObjectId(propertyId);

    // Fetch property details
    const property = await Property.findById(property_id);
    if (!property) {
      return {
        success: false,
        message: "Property not found",
      };
    }

    // Get existing bookings during the requested dates
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

    // Check if rooms are available for the requested dates
    const availableRooms = property.maxRooms - bookedRooms;

    if (availableRooms > 0) {
      return {
        success: true,
        message: `Rooms are available. ${availableRooms} rooms available.`,
        availableRooms,
      };
    }

    // If no rooms are available, find the next available date
    const nextAvailableDate = await findNextAvailableDate(
      property_id,
      checkIn,
      checkOut
    );

    return {
      success: false,
      message: `No rooms available for the selected dates. The next available date is ${nextAvailableDate}`,
      availableRooms: 0,
      nextAvailableDate,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Error checking availability" };
  }
}

// Helper function to find the next available date
async function findNextAvailableDate(
  propertyId: ObjectId,
  checkIn: string,
  checkOut: string
): Promise<string> {
  const property = await Property.findById(propertyId);

  // Get all bookings after the requested checkOut date
  const futureBookings = await Booking.find({
    propertyId: propertyId,
    checkIn: { $gte: checkOut },
    status: { $eq: "Confirmed" },
  }).sort({ checkIn: 1 });

  // Find the first available date after the last booking
  if (futureBookings.length === 0) {
    // If no bookings exist after the requested checkOut date, property is free
    return moment(checkOut).format("YYYY-MM-DD");
  }

  // Check the first booking after the requested dates
  const nextBooking = futureBookings[0];
  const nextAvailableDate = moment(nextBooking.checkIn).subtract(1, "days");

  // If the property is free on the day before the next booking, return it
  return nextAvailableDate.format("YYYY-MM-DD");
}
