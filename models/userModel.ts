import mongoose, { Schema, Document } from "mongoose";

/* The User model is designed to support both local jwt auth and firebase google/github auth */
export interface IUser extends Document {
  userame?: string;
  password?: string;
  authprovider: "local" | "google" | "github";
  firebaseUid?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String },
    email: { type: String, required: true },
    password: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      required: true,
    },
    firebaseUid: { type: String }, // Only for Google/GitHub via Firebase
    profileImage: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, authProvider: 1 }, { unique: true });

const Board = mongoose.model<IUser>("User", UserSchema);
export default Board;
