import { Types } from "mongoose";

export const convertToPlainObject = (data: any): any => {
  if (!data) return data;

  // If it's an array, process each item
  if (Array.isArray(data)) {
    return data.map((item) => convertToPlainObject(item));
  }

  // Handle ObjectId and Date types explicitly
  if (data instanceof Types.ObjectId) {
    return data.toString();
  }

  if (data instanceof Date) {
    return data.toISOString(); // Convert Date to string
  }

  if(data instanceof Number){
    return Number(data);
  }

  // If it's an object, clean and convert it
  if (typeof data === "object" && data !== null) {
    const plainObject: any = {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (key !== "__v") {
          plainObject[key] = convertToPlainObject(data[key]); // Recursively clean nested objects
        }
      }
    }

    return plainObject;
  }

  return data;
};
