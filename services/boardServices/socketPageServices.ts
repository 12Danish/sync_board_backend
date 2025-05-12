import Board, { IBoard } from "../../models/boardModel";
import { IPage } from "../../models/boardModel";
import PageChanges from "../../models/changesModel";
import { ObjectId } from "mongoose";
import { CustomError } from "../../utils/customError";
interface socketPageChangesInput {
  changerId: ObjectId | string;
  boardId: string;
  updated_page: IPage;
}

interface socketPageDeleteInput {
  changerId: ObjectId | string;
  boardId: string;
  pageNumber: number; // The page number to delete
}
const socketPageUpdateService = async (input: socketPageChangesInput) => {
  try {
    console.log("This is the input coming in");
    console.log(input);
    // Check if board exists first
    const boardExists = await Board.exists({ _id: input.boardId });

    if (!boardExists) {
      throw new CustomError("The specified board does not exist", 404);
    }

    // Get the previous state before our update for history tracking
    const board = await Board.findById(input.boardId);
    const oldPages = board ? JSON.parse(JSON.stringify(board.pages)) : [];

    // Prepare the whiteboard objects
    const updatedWhiteBoardObjects = Array.isArray(
      input.updated_page.whiteBoardObjects
    )
      ? input.updated_page.whiteBoardObjects
      : [input.updated_page.whiteBoardObjects];

    // First, try to update an existing page (atomic operation)
    const updateResult = await Board.findOneAndUpdate(
      {
        _id: input.boardId,
        "pages.pageNumber": input.updated_page.pageNumber,
      },
      {
        $set: {
          "pages.$.whiteBoardObjects": updatedWhiteBoardObjects,
        },
      },
      {
        new: true, // Return the updated document
      }
    );

    let updatedBoard;

    // If no document was updated (page doesn't exist), add the new page (atomic operation)
    if (!updateResult) {
      updatedBoard = await Board.findByIdAndUpdate(
        input.boardId,
        {
          $push: {
            pages: {
              pageNumber: input.updated_page.pageNumber,
              whiteBoardObjects: updatedWhiteBoardObjects,
            },
          },
        },
        { new: true }
      );

      if (!updatedBoard) {
        throw new CustomError("Failed to add new page to board", 500);
      }
    } else {
      updatedBoard = updateResult;
    }

    // Record the change in history
    await PageChanges.create({
      boardId: updatedBoard._id,
      changerId: input.changerId,
      old_pages: oldPages,
      new_pages: JSON.parse(JSON.stringify(updatedBoard.pages)),
    });

    return true;
  } catch (err: any) {
    // If the error is already a CustomError, rethrow it
    if (err instanceof CustomError) {
      throw err;
    }

    // Generic error handler
    throw new CustomError(
      `The following error occurred while trying to update the board: ${
        err.message || err
      }`,
      500
    );
  }
};
const socketPageDeleteService = async (input: socketPageDeleteInput) => {
  try {
    // Ensure the board exists
    const board = await Board.findById(input.boardId);
    if (!board) {
      throw new CustomError("The specified board does not exist", 404);
    }

    // Clone old pages for history
    const oldPages = JSON.parse(JSON.stringify(board.pages));

    // Check if the page exists
    const pageExists = board.pages.some(
      (page) => page.pageNumber === input.pageNumber
    );

    if (!pageExists) {
      throw new CustomError("The specified page does not exist", 404);
    }

    // Atomically pull the page from the board
    const updatedBoard = await Board.findByIdAndUpdate(
      input.boardId,
      {
        $pull: { pages: { pageNumber: input.pageNumber } },
      },
      { new: true }
    );

    if (!updatedBoard) {
      throw new CustomError("Failed to delete the page from the board", 500);
    }

    // Record the change in PageChanges history
    await PageChanges.create({
      boardId: updatedBoard._id,
      changerId: input.changerId,
      old_pages: oldPages,
      new_pages: JSON.parse(JSON.stringify(updatedBoard.pages)),
    });

    return true;
  } catch (err: any) {
    if (err instanceof CustomError) {
      throw err;
    }

    throw new CustomError(
      `The following error occurred while trying to delete the page: ${
        err.message || err
      }`,
      500
    );
  }
};

export { socketPageUpdateService, socketPageDeleteService };
