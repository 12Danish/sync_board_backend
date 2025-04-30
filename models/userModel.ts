import mongoose, { Schema, Document } from "mongoose";

/* The User model is designed to support both local jwt auth and firebase google/github auth */
export interface IUser extends Document {
  username?: string;
  password?: string;
  email: string;
  authProvider: "local" | "google" | "github";
  firebaseUid?: string;
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
   
  },
  { timestamps: true }
);

// Define the toJSON method to exclude the password field
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; // Remove password from the response
  delete obj.__v; // Remove __v from the response
  return obj;
};

UserSchema.index({ email: 1, authProvider: 1 }, { unique: true });

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
