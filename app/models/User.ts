import mongoose, { Schema, Document } from "mongoose";

export interface IUser{
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
