import { socketEventsInput } from "../../utils/testUtils/joinBoardHelper";
import { joinRoom } from "../../utils/testUtils/joinBoardHelper";
import Board from "../../models/boardModel";
import ShapeChanges from "../../models/changesModel";
export const socketTextEventsTester = async (input: socketEventsInput) => {
  await joinRoom(input);
  console.log("Rooms joined for text events");

  return new Promise<void>((resolve, reject) => {
    const boardId = input.boardId;

    const addTextData = {
      x: 100,
      y: 120,
      boardId,
      text: "Hello World",
      style: { fontSize: 14, fontWeight: "bold" },
    };

    const backspaceData = {
      boardId,
      textId: "text-001",
    };

    const editTextData = {
      boardId,
      textId: "text-001",
      newText: "Updated Content",
    };

    const timeout = setTimeout(() => {
      reject(new Error("One or more text events were not received in time"));
    }, 30000);

    let stage = 0;

    const onAddedText = (data: any) => {
      try {
        expect(data.x).toBe(addTextData.x);
        expect(data.y).toBe(addTextData.y);
        expect(data.text).toBe(addTextData.text);
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
        expect(data.textId).toBe(backspaceData.textId);
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
        expect(data.textId).toBe(editTextData.textId);
        expect(data.newText).toBe(editTextData.newText);
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ editedText event validated");

        // 1. Check if Board shapes were updated
        const updatedBoard = await Board.findById(boardId);
        expect(updatedBoard).not.toBeNull();
        expect(updatedBoard?.shapes).toBeDefined();
        console.log("Updated Board Shapes:", updatedBoard?.shapes);

        // 2. Check if ShapeChanges entry was added
        const shapeChangeEntry = await ShapeChanges.findOne({ boardId }).sort({
          createdAt: -1,
        });
        expect(shapeChangeEntry).not.toBeNull();
        expect(shapeChangeEntry?.changerId.toString()).toBe(data.userId);
        console.log("New Shape Change Entry:", shapeChangeEntry);

        input.clientSocketUser2.off("editedText", onEditedText);
        clearTimeout(timeout);
        resolve();
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    // Start with addText
    input.clientSocketUser2.on("addedText", onAddedText);
    input.clientSocketUser1.emit("addText", addTextData);
  });
};
