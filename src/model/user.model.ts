import mongoose, { model, Model, Schema } from "mongoose";

export type KycStatus = "Pending" | "Approved" | "Rejected";

export interface IUser {
  fullName: string;
  email: string;
  phone: string;
  walletBalace?: number;

  isBlocked?: boolean;
  kycStatus?: KycStatus;
  deviceInfo?: {
    ipAddress?: string;
    deviceType?: string;
    os?: string;
  };

  createdAt?: Date;
  updateAt?: Date;
}

type UserModel = Model<IUser, object>;

const userSchema = new Schema<IUser, UserModel>(
  {
    fullName: { type: String, required: true, minlength: 3 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
    }, /// validity we will do later
    phone: { type: String, required: true, unique: true, index: true }, // validity regex through ai

    walletBalace: { type: Number, default: 0, min: 0 },

    isBlocked: { type: Boolean, default: false, index: true },
    kycStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    deviceInfo: {
      ipAddress: { type: String },
      deviceType: { type: String }, // mobile / Desktop,
      os: { type: String }, //(Android/iOS/Windows/macOS)
    },
  },
  {
    timestamps: true,
  },
);

export const User = model<IUser, UserModel>("User", userSchema);
