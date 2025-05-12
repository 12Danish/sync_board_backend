import mongoose, { Schema, Document } from "mongoose";

export interface ICollaborator {
  user: mongoose.Types.ObjectId;
  permission: "view" | "edit";
}

export interface IPage {
  pageNumber: number;
  whiteBoardObjects: { [key: string]: any }[];
  [key: string]: any; // Other dynamic properties
}
// Define the TypeScript Interface
export interface IBoard extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  collaborators: ICollaborator[]; // Array of user IDs or emails
  thumbnail_img: string;
  pages: IPage[]; // Array of flexible objects (dynamic)
  security: "public" | "private";
}

export const PageSchema: Schema = new Schema(
  {
    pageNumber: { type: Number, required: true },
    whiteBoardObjects: {
      type: [Schema.Types.Mixed], // allows any structure inside the array
      default: [],
    },
  },
  { _id: false, strict: false }
);

const BoardSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        permission: {
          type: String,
          enum: ["view", "edit"],
          required: true,
        },
      },
    ],
    pages: { type: [PageSchema], default: [] },
    thumbnail_img: { type: String, default: "" },
    security: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
  },
  { timestamps: true }, // Allows to automatically fill time fields'
 
);

// Compound unique index to prevent duplicate board names per user
BoardSchema.index({ createdBy: 1, name: 1 }, { unique: true });

const Board = mongoose.model<IBoard>("Board", BoardSchema);
export default Board;
