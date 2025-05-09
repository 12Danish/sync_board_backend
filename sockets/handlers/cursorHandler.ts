import { Socket, Server } from "socket.io";

import { CustomError } from "../../utils/customError";

export const registerCursorHandler = (
  io: Server,
  socket: Socket,
  permission: any,
  userId: string,
  userEmail: string
) => {
  if (!permission) {
    socket.emit(
      "error",
      new CustomError("You do not have permission to view this.", 403)
    );

    return;
  }

  socket.on("cursorMove", (data) => {
    console.log("Broadcasting cursor information to different users.");

    socket.to(data.boardId).emit("cursorMoved", { ...data, userEmail, userId });
  });
};
