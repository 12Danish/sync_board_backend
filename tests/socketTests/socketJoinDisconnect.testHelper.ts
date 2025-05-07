interface socketJoinDisconnectTesterInput {
  clientSocketUser1: any;
  clientSocketUser2: any;
  boardId: string;
}
export const socketJoinDisconnectTester = (
  input: socketJoinDisconnectTesterInput
) => {
  return new Promise<void>((resolve) => {
    let joinCount = 0;
    let disconnectCount = 0;

    const checkDone = () => {
      if (joinCount === 2 && disconnectCount === 2) {
        resolve();
      }
    };
    input.clientSocketUser1.emit("joinBoard", input.boardId);
    joinCount++;

    input.clientSocketUser2.emit("joinBoard", input.boardId);
    joinCount++;

    input.clientSocketUser1.on("disconnect", () => {
      disconnectCount++;
      checkDone();
    });

    input.clientSocketUser2.on("disconnect", () => {
      disconnectCount++;
      checkDone();
    });

    // Close sockets to trigger disconnect
    setTimeout(() => {
      input.clientSocketUser1.close();
      input.clientSocketUser2.close();
    }, 100); // slight delay to ensure join happens before disconnect
  });
};
