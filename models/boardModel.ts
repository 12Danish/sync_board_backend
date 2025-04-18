import mongoose, { Schema, Document } from "mongoose";
import { nanoid } from "nanoid";

// Define the TypeScript Interface
export interface IBoard extends Document {
  documentId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  collaborators: string[]; // Array of user IDs or emails
  thumbnail_img: string;
  shapes: { [key: string]: any }[]; // Array of flexible objects (dynamic)
}

const BoardSchema: Schema = new Schema(
  {
    documentId: {
      type: Number,
      required: true,
      unique: true,
      default: () => nanoid(6),
    },
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shapes: { type: [Schema.Types.Mixed], default: [] },
    thumbnail_img: { type: String, default: "" },
  },
  { timestamps: true } // Allows to automatically fill time fields
);

const Board = mongoose.model<IBoard>("Board", BoardSchema);
export default Board;
