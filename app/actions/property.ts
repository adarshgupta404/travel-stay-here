"use server";

import { connectDB } from "@/app/lib/mongodb";
import { IProperty, Property } from "@/app/models/Property";
import mongoose from "mongoose";

export async function getPropertyById(property_id: string) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(property_id)) {
      return { success: false, message: "Invalid Property ID format" };
    }

    const property = await Property.findById(property_id);

    if (!property) {
      return { success: false, message: "Property not found" };
    }

    return { success: true, data: property };
  } catch (error) {
    console.error("Error fetching property:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getPropertyBySlug(slug: string) {
  await connectDB();

  const property = await Property.findOne({ slug });
  if (!property) {
    return { success: false, data: null };
  }

  return { success: true, data: JSON.parse(JSON.stringify(property)) };
}

export async function getAllProperties() {
  try {
    await connectDB();

    const properties = await Property.find()
      .select(
        "_id name slug price type maxGuests maxRooms location description images available createdAt rating discount reviews"
      )
      .limit(4)
      .lean<IProperty[]>();

    const formattedProperties = properties.map(
      ({ _id, ...rest }) => ({
        _id: _id.toString(), 
        ...rest,
      })
    );
    return { success: true, data: formattedProperties };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { success: false, data: [], message: "Failed to fetch properties" };
  }
}
