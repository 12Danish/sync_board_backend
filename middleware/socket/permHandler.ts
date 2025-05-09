import Board from "../../models/boardModel";
import { Socket } from "socket.io";
import { CustomError } from "../../utils/customError";
import { IBoard } from "../../models/boardModel";
export const socketPermMiddleware = async (
  socket: Socket,
  boardId: string
): Promise<"edit" | "view"> => {
  const userId = (socket as any).user.id;

  if (!boardId) {
    throw new CustomError("BoardId needs to be provided", 400);
  }

  const board: IBoard | null = await Board.findById(boardId);
  if (!board) {
    throw new CustomError("The specified board does not exist", 404);
  }

  if (board.createdBy.toString() === userId.toString()) {
    return "edit";
  }

  const collaborator = board.collaborators.find(
    (collab: any) => collab.user.toString() === userId.toString()
  );

  if (collaborator) {
    return collaborator.permission;
  }

  if (board.security === "public") {
    return "view";
  }

  throw new CustomError("You are not authorized to access this board", 403);
};
