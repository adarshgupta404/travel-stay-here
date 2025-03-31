"use server";

import bcrypt from "bcrypt";
import { connectDB } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";

export async function registerUser(user: { name: string; email: string; password: string }) {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = new User({
      name: user.name,
      email: user.email,
      password: hashedPassword,
    });

    await newUser.save();

    return { success: true, userId: newUser._id.toString() };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getUser(email:string) {
  try {
    await connectDB();
    const existingUser = await User.findOne({ email });
    return { success: true, userId: existingUser._id.toString() };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: "Something went wrong" };
  }
}


