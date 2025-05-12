import { socketEventsInput } from "../../utils/testUtils/joinBoardHelper";
import { joinRoom } from "../../utils/testUtils/joinBoardHelper";
import Board from "../../models/boardModel";
import PageChanges from "../../models/changesModel";

export const socketTextEventsTester = async (input: socketEventsInput) => {
  await joinRoom(input);
  console.log("Rooms joined for text events");

  return new Promise<void>((resolve, reject) => {
    const boardId = input.boardId;
    const pageNumber = 1;

    const addTextData = {
      boardId,
      updatedBoardPage: {
        pageNumber,
        whiteBoardObjects: {
          type: "text",
          id: "text-001",
          x: 100,
          y: 120,
          text: "Hello World",
          style: { fontSize: 14, fontWeight: "bold" },
        },
      },
    };

    const backspaceData = {
      boardId,
      updatedBoardPage: {
        pageNumber,
        whiteBoardObjects: {
          type: "text",
          id: "text-001",
        },
      },
    };

    const editTextData = {
      boardId,
      updatedBoardPage: {
        pageNumber,
        whiteBoardObjects: {
          type: "text",
          id: "text-001",
          newText: "Updated Content",
        },
      },
    };

    const timeout = setTimeout(() => {
      reject(new Error("One or more text events were not received in time"));
    }, 30000);

    const onAddedText = (data: any) => {
      try {
        expect(data.updatedBoardPage.whiteBoardObjects.x).toBe(
          addTextData.updatedBoardPage.whiteBoardObjects.x
        );
        expect(data.updatedBoardPage.whiteBoardObjects.y).toBe(
          addTextData.updatedBoardPage.whiteBoardObjects.y
        );
        expect(data.updatedBoardPage.whiteBoardObjects.text).toBe(
          addTextData.updatedBoardPage.whiteBoardObjects.text
        );
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ addedText event validated");

        input.clientSocketUser2.off("addedText", onAddedText);
        input.clientSocketUser2.on("backspacedText", onBackspacedText);
        input.clientSocketUser1.emit("backspaceText", backspaceData);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    const onBackspacedText = (data: any) => {
      try {
        expect(data.updatedBoardPage.whiteBoardObjects.id).toBe(
          backspaceData.updatedBoardPage.whiteBoardObjects.id
        );
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ backspacedText event validated");

        input.clientSocketUser2.off("backspacedText", onBackspacedText);
        input.clientSocketUser2.on("editedText", onEditedText);
        input.clientSocketUser1.emit("editText", editTextData);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    const onEditedText = async (data: any) => {
      try {
        expect(data.updatedBoardPage.whiteBoardObjects.id).toBe(
          editTextData.updatedBoardPage.whiteBoardObjects.id
        );
        expect(data.updatedBoardPage.whiteBoardObjects.newText).toBe(
          editTextData.updatedBoardPage.whiteBoardObjects.newText
        );
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ editedText event validated");

        // 1. Check if board pages were updated
        const updatedBoard = await Board.findById(boardId);
        expect(updatedBoard).not.toBeNull();
        expect(updatedBoard?.pages).toBeDefined();
        console.log("Updated Board Pages:", updatedBoard?.pages);

        // 2. Check if PageChanges entry was added
        const changeEntry = await PageChanges.findOne({ boardId }).sort({
          createdAt: -1,
        });
        expect(changeEntry).not.toBeNull();
        expect(changeEntry?.changerId.toString()).toBe(data.userId);
        console.log("New Page Change Entry:", changeEntry);

        input.clientSocketUser2.off("editedText", onEditedText);
        clearTimeout(timeout);
        resolve();
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    // Start the event chain with addText
    input.clientSocketUser2.on("addedText", onAddedText);
    input.clientSocketUser1.emit("addText", addTextData);
  });
};
