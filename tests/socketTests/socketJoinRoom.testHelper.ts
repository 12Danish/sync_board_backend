import { socketEventsInput } from "../../utils/testUtils/joinBoardHelper";

export const socketJoinRoomTester = (input: socketEventsInput) => {
  return new Promise<void>((resolve, reject) => {
    // Set a safety timeout to avoid hanging test
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for board join confirmation"));
    }, 4000);

    // When both sockets have joined, we'll resolve
    let user1Joined = false;
    let user2Joined = false;

    // Handler for checking if both users have joined
    const checkBothJoined = () => {
      if (user1Joined && user2Joined) {
        console.log("Both users have joined the board successfully");
        clearTimeout(timeout);
        resolve();
      }
    };

    // Listen for the JoinedBoard event from both sockets
    input.clientSocketUser1.once("joinedBoard", (data: any) => {
      console.log("User 1 received JoinedBoard event:", data);
      user1Joined = true;
      checkBothJoined();
    });

    input.clientSocketUser2.once("joinedBoard", (data: any) => {
      console.log("User 2 received JoinedBoard event:", data);
      user2Joined = true;
      checkBothJoined();
    });

    // Listen for errors from both sockets
    input.clientSocketUser1.on("error", (err: any) => {
      clearTimeout(timeout);
      reject(new Error(`User 1 failed to join the board: ${err.message}`));
    });

    input.clientSocketUser2.on("error", (err: any) => {
      clearTimeout(timeout);
      reject(new Error(`User 2 failed to join the board: ${err.message}`));
    });

    // Emit the joinBoard events
    console.log("Emitting joinBoard for user 1");
    input.clientSocketUser1.emit("joinBoard", input.boardId);

    console.log("Emitting joinBoard for user 2");
    input.clientSocketUser2.emit("joinBoard", input.boardId);
  });
};
