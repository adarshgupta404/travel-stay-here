"use server";

import { connectDB } from "@/app/lib/mongodb";
import { IProperty, Property } from "@/app/models/Property";
import { convertToPlainObject } from "@/lib/objectConvert";
import mongoose from "mongoose";
import { slugify } from "@/lib/utils";

interface CreatePropertyParams {
  name: string;
  price: number;
  discount: number;
  type: string;
  location: string;
  description: string;
  images: string[];
  available: boolean;
  maxGuests: number;
  maxRooms: number;
  amenities?: string[];
  hostName: string;
  hostContact: string;
  cancellationPolicy: string;
  checkInTime: string;
  checkOutTime: string;
  latitude: number;
  longitude: number;
  userId: string;
  rating: number;
  reviews: number;
}


interface UpdatePropertyParams {
  _id: string
  name: string
  price: number
  discount: number
  type: string
  location: string
  description: string
  images: string[]
  available: boolean
  maxGuests: number
  maxRooms: number
  amenities?: string[]
  hostName: string
  hostContact: string
  cancellationPolicy: string
  checkInTime: string
  checkOutTime: string
  latitude: number
  longitude: number
}
export async function createProperty(params: CreatePropertyParams) {
  try {
    await connectDB();

    // Generate a slug from the property name
    const baseSlug = slugify(params.name);

    // Check if slug exists and create a unique one if needed
    let slug = baseSlug;
    let counter = 1;

    while (await Property.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newProperty = new Property({
      name: params.name,
      slug,
      price: params.price,
      discount: params.discount,
      type: params.type,
      location: params.location,
      description: params.description,
      images: params.images,
      available: params.available,
      maxGuests: params.maxGuests,
      maxRooms: params.maxRooms,
      amenities: params.amenities || [],
      host: {
        name: params.hostName,
        contact: params.hostContact,
      },
      policies: {
        cancellation: params.cancellationPolicy,
        checkInTime: params.checkInTime,
        checkOutTime: params.checkOutTime,
      },
      coordinates: {
        latitude: params.latitude,
        longitude: params.longitude,
      },
      userId: params.userId,
      rating: params.rating,
      reviews: params.reviews,
    });

    await newProperty.save();

    // revalidatePath("/properties")
    // revalidatePath("/dashboard")

    return {
      success: true,
      slug,
    };
  } catch (error) {
    console.error("Error creating property:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create property",
    };
  }
}
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

    return { success: true, data: JSON.parse(JSON.stringify(property)) };
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

    const formattedProperties = properties.map(({ _id, ...rest }) => ({
      _id: _id.toString(),
      ...rest,
    }));
    return {
      success: true,
      data: JSON.parse(JSON.stringify(formattedProperties)),
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { success: false, data: [], message: "Failed to fetch properties" };
  }
}
export async function getUserProperties(userId: string) {
  try {
    await connectDB();

    const properties = await Property.find({ userId }).sort({ createdAt: -1 });

    // Convert Mongoose documents to plain objects
    return JSON.parse(JSON.stringify(properties));
  } catch (error) {
    console.error("Error fetching user properties:", error);
    throw new Error("Failed to fetch properties");
  }
}

export async function deleteProperty(propertyId: string) {
  try {
    await connectDB();

    await Property.findByIdAndDelete(propertyId);

    // revalidatePath("/listings")
    // revalidatePath("/properties")

    return { success: true };
  } catch (error) {
    console.error("Error deleting property:", error);
    throw new Error("Failed to delete property");
  }
}


export async function updateProperty(params: UpdatePropertyParams) {
  try {
    await connectDB()

    const property = await Property.findById(params._id)

    if (!property) {
      throw new Error("Property not found")
    }

    // Check if name changed and update slug if needed
    let slug = property.slug
    if (property.name !== params.name) {
      const baseSlug = slugify(params.name)
      slug = baseSlug
      let counter = 1

      // Check if new slug exists (excluding current property)
      while (await Property.findOne({ slug, _id: { $ne: params._id } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      new mongoose.Types.ObjectId(params._id),
      {
        name: params.name,
        slug,
        price: params.price,
        discount: params.discount,
        type: params.type,
        location: params.location,
        description: params.description,
        images: params.images,
        available: params.available,
        maxGuests: params.maxGuests,
        maxRooms: params.maxRooms,
        amenities: params.amenities || [],
        host: {
          name: params.hostName,
          contact: params.hostContact,
        },
        policies: {
          cancellation: params.cancellationPolicy,
          checkInTime: params.checkInTime,
          checkOutTime: params.checkOutTime,
        },
        coordinates: {
          latitude: params.latitude,
          longitude: params.longitude,
        },
      },
      { new: true },
    )

    // revalidatePath(`/properties/${slug}`)
    // revalidatePath("/properties")
    // revalidatePath("/listings")

    return {
      success: true,
      slug,
    }
  } catch (error) {
    console.error("Error updating property:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update property",
    }
  }
}

