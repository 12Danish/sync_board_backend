import mongoose, { Schema, Document } from "mongoose";
import { IPage } from "./boardModel";
import { PageSchema } from "./boardModel";

export interface IPageChanges {
  boardId: mongoose.Types.ObjectId;
  changerId: mongoose.Types.ObjectId;
  old_pages: IPage[];
  new_pages: IPage[];
  time: Date;
}

const PageChangesSchema: Schema = new Schema({
  boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
  changerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  old_pages: { type: [PageSchema], required: true },
  new_pages: { type: [PageSchema], required: true },
  time: { type: Date, default: Date.now },
});

const PageChanges = mongoose.model<IPageChanges>(
  "PageChanges",
  PageChangesSchema
);

export default PageChanges;
