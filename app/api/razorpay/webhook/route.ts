import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/app/lib/mongodb";
import { Booking } from "@/app/models/Bookings";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const body = await req.json();
  const { bookingId, orderId, paymentId } = body;

  try {
    await connectDB();

    const booking = await Booking.findOne({ _id: bookingId });
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: "Booking not found",
      });
    }

    // Update booking status to confirmed
    booking.status = "Confirmed";
    booking.orderId = orderId;
    booking.paymentId = paymentId;
    await booking.save();

    return NextResponse.json({ success: true, message: "Payment verified" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "Payment verification failed",
    });
  }
}
