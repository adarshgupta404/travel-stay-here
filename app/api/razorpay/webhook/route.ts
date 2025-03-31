import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/app/lib/mongodb";
import { Booking } from "@/app/models/Bookings";
import { ObjectId } from "mongodb";
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

    // Create a test account with Ethereal
    const testAccount = await nodemailer.createTestAccount();
    const property = await getPropertyById(booking.propertyId)
    // Create a Nodemailer transporter using Ethereal's SMTP server
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "mario.kiehn@ethereal.email",
        pass: "xA98q3TH7F8WC2Y8Jp", // Ethereal password
      },
    });

    // Prepare email content
    const mailOptions = {
      from: "your-email@example.com", // Sender's email address
      to: booking.email, // Recipient's email address
      subject: "Booking Confirmed - Your Stay at Our Property",
      text: `
        Dear ${booking.name},

        We're excited to inform you that your booking has been confirmed!

        Property: ${property.data.name}
        Check-In: ${booking.checkIn}
        Check-Out: ${booking.checkOut}
        Total Price: Rs. ${booking.totalPrice}

        Thank you for choosing us. We look forward to welcoming you!

        Best regards,
        The Team
      `,
    };

    // Send the email using Nodemailer
    const info = await transporter.sendMail(mailOptions);

    // console.log("Message sent: %s", info.messageId);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

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
