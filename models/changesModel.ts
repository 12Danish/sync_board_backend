import mongoose, { Schema, Document } from "mongoose";

export interface IShapeChanges {
  boardId: mongoose.Types.ObjectId;
  changerId: mongoose.Types.ObjectId;
  old_shapes: { [key: string]: any }[];
  new_shapes: { [key: string]: any }[];
  time: Date;
}

const shapeChangesSchema: Schema = new Schema({
  boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
  changerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  old_shapes: { type: [Schema.Types.Mixed], required: true },
  new_shapes: { type: [Schema.Types.Mixed], required: true },
  time: { type: Date, default: Date.now },
});

const ShapeChanges = mongoose.model<IShapeChanges>(
  "ShapeChanges",
  shapeChangesSchema
);

export default ShapeChanges;
