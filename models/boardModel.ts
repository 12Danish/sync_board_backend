import mongoose, { Schema, Document } from "mongoose";

export interface ICollaborator {
  user: mongoose.Types.ObjectId;
  permission: "view" | "edit";
}
// Define the TypeScript Interface
export interface IBoard extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  collaborators: ICollaborator[]; // Array of user IDs or emails
  thumbnail_img: string;
  shapes: { [key: string]: any }[]; // Array of flexible objects (dynamic)
  security: "public" | "private";
}

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
    shapes: { type: [Schema.Types.Mixed], default: [] },
    thumbnail_img: { type: String, default: "" },
    security: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
  },
  { timestamps: true } // Allows to automatically fill time fields
);

// Compound unique index to prevent duplicate board names per user
BoardSchema.index({ createdBy: 1, name: 1 }, { unique: true });

const Board = mongoose.model<IBoard>("Board", BoardSchema);
export default Board;
