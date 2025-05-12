import mongoose, { Schema, Document } from "mongoose";

export interface IChanges {
  boardId: mongoose.Types.ObjectId;
  changerId: mongoose.Types.ObjectId;
  old_shapes: { [key: string]: any }[];
  new_shapes: { [key: string]: any }[];
  updated_at: Date;
}

const changesSchema : Schema  = new Schema ({
    boardId : {type: Schema.Types.ObjectId, ref : "Board", required : true}
})