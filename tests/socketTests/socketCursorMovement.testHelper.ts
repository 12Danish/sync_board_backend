import { socketEventsInput } from "../../utils/testUtils/joinBoardHelper";
import { joinRoom } from "../../utils/testUtils/joinBoardHelper";
export const socketCursorMovementTester = async (input: socketEventsInput) => {
  await joinRoom(input);
  console.log("Rooms joined by both users in cursor");
  return new Promise<void>((resolve, reject) => {
    const cursorData = {
      x: 200,
      y: 150,
      boardId: input.boardId,
    };

    // Set timeout locally inside the Promise
    const timeout = setTimeout(() => {
      reject(new Error("cursorMove event not received in time"));
    }, 25000);

    input.clientSocketUser2.on("cursorMoved", (data: any) => {
      try {
        console.log("Listening to event for cursor movement");
        expect(data.x).toBe(200);
        expect(data.y).toBe(150);
        expect(data.userId).toBeDefined();
        expect(data.userEmail).toBeDefined();

        console.log("cursorMove event received:", data);
        clearTimeout(timeout);
        resolve();
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });

    console.log("Broadcasting cursor movement");
    input.clientSocketUser1.emit("cursorMove", cursorData);
  });
};
