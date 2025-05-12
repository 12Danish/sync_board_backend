import Board, { IBoard } from "../../models/boardModel";

import ShapeChanges from "../../models/changesModel";
import { ObjectId } from "mongoose";
import { CustomError } from "../../utils/customError";
interface socketShapeChangesInput {
  changerId: ObjectId | string;
  boardId: string;
  new_shapes: { [key: string]: any };
}
const socketShapeService = async (input: socketShapeChangesInput) => {
  try {
    const board: IBoard | null = await Board.findById(input.boardId);

    if (!board) {
      throw new CustomError("The specified board does not exist", 404);
    }

    const prev_shapes = board.shapes;
    const newShapesArray = Array.isArray(input.new_shapes)
      ? input.new_shapes
      : [input.new_shapes];

    await ShapeChanges.create({
      boardId: board._id,
      changerId: input.changerId,
      old_shapes: prev_shapes,
      new_shapes: newShapesArray,
    });

    // Replace shapes
    board.shapes = newShapesArray;

    // Save the updated board
    await board.save();

    return true;
  } catch (err: any) {
    // If the error is already a CustomError, rethrow it
    if (err instanceof CustomError) {
      throw err;
    }

    // Generic error handler
    throw new CustomError(
      `The following error occurred while trying to delete the board: ${
        err.message || err
      }`,
      500
    );
  }
};

export { socketShapeService };
