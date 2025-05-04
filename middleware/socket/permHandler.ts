import Board from "../../models/boardModel";
import { Socket } from "socket.io";
import { CustomError } from "../../utils/customError";
import { IBoard } from "../../models/boardModel";
export const socketPermMiddleware = async (
  socket: Socket,
  next: (err?: CustomError) => void
) => {
  const user = (socket as any).user;
  const boardId = socket.handshake.query.boardId;
  let permission = null;
  if (!boardId) {
    return next(new CustomError("BoardId needs to be provided", 400));
  }

  const board: IBoard | null = await Board.findById(boardId);

  if (!board) {
    return next(new CustomError("The specified board does not exist", 404));
  }

  if (board.security == "public") {
    permission = "view";
  }

  if (board.createdBy.toString() == user.toString()) {
    permission = "edit";
  } else {
    const collaborator = board.collaborators.find(
      (collab: any) => collab.user.toString() === user.toString()
    );

    if (collaborator) {
      permission = collaborator.permission;
    }
  }

  if (permission) {
    (socket as any).permission = permission;
    next();
  } else {
    next(new CustomError("You are not authrized to access this board", 403));
  }
};
