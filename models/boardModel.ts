import mongoose, { Schema, Document } from "mongoose";

// Define the TypeScript Interface
export interface IBoard extends Document {
  name: string;
  documentId: string;
  createdAt: Date;
  updatedAt: Date;
  collaborators: string[]; // Array of user IDs or emails
  thumbnail_img: string;
  shapes: { [key: string]: any }[]; // Array of flexible objects (dynamic)
}

const BoardSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    documentId: { type: Number, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shapes: { type: [Schema.Types.Mixed], default: [] },
    thumbnail_img: { type: String, default: "" },
  },
  { timestamps: true } // Allows to automatically fill time fields
);

const Board = mongoose.model<IBoard>("Board", BoardSchema);
export default Board;
