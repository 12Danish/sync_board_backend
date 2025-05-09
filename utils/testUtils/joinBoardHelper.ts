interface socketEventsInput {
  clientSocketUser1: any;
  clientSocketUser2: any;
  boardId: string;
}
// Helper function to join the room
const joinRoom = (input: socketEventsInput) => {
  return new Promise<void>((resolve, reject) => {
    // Set a safety timeout
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for board join confirmation"));
    }, 4000);

    // Track joining status
    let user1Joined = false;
    let user2Joined = false;

    // Check if both users have joined
    const checkBothJoined = () => {
      if (user1Joined && user2Joined) {
        console.log("Both users have joined the board for cursor test");
        clearTimeout(timeout);
        resolve();
      }
    };

    // Set up listeners for join events
    input.clientSocketUser1.once("joinedBoard", (data: any) => {
      console.log("User 1 joined board for cursor test:", data);
      user1Joined = true;
      checkBothJoined();
    });

    input.clientSocketUser2.once("joinedBoard", (data: any) => {
      console.log("User 2 joined board for cursor test:", data);
      user2Joined = true;
      checkBothJoined();
    });

    // Emit join events
    console.log("Re-joining board for cursor test - user 1");
    input.clientSocketUser1.emit("joinBoard", input.boardId);

    console.log("Re-joining board for cursor test - user 2");
    input.clientSocketUser2.emit("joinBoard", input.boardId);
  });
};

export { joinRoom, socketEventsInput };
