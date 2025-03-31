import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import { Booking } from "@/app/models/Bookings";
import { getPropertyById } from "@/app/actions/property";

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

    const property = await getPropertyById(booking.propertyId);

    // Send email using Web3Forms
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_SECRET!, // Replace with your Web3Forms API key
        from_name: "Your Booking Service",
        name: booking.name,
        email: booking.email,
        subject: "Booking Confirmed - Your Stay at Our Property",
        message: `
          Dear ${booking.name},

          We're excited to inform you that your booking has been confirmed!

          🏠 Property: ${property.data.name}
          📅 Check-In: ${booking.checkIn}
          📅 Check-Out: ${booking.checkOut}
          💰 Total Price: Rs. ${booking.totalPrice}

          Thank you for choosing us. We look forward to welcoming you!

          Best regards,  
          The Team
        `,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: "Payment verified but email sending failed",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and email sent",
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "Payment verification failed or email sending failed",
    });
  }
}
