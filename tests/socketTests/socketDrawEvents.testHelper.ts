import { socketEventsInput } from "../../utils/testUtils/joinBoardHelper";
import { joinRoom } from "../../utils/testUtils/joinBoardHelper";

export const socketDrawEventsTester = async (input: socketEventsInput) => {
  await joinRoom(input);
  console.log("Rooms joined for draw events");

  return new Promise<void>((resolve, reject) => {
    const boardId = input.boardId;

    const drawData = {
      boardId,
      shape: { type: "rectangle", x: 10, y: 20, width: 100, height: 50 },
    };

    const eraseData = {
      boardId,
      shapeId: "shape-123",
    };

    const editShapeData = {
      boardId,
      shapeId: "shape-123",
      newColor: "red",
    };

    const timeout = setTimeout(() => {
      reject(new Error("One or more draw events were not received in time"));
    }, 30000);

    const onNewDrawing = (data: any) => {
      try {
        expect(data.boardId).toBe(drawData.boardId);
        expect(data.shape).toEqual(drawData.shape);
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ newDrawing event validated");

        input.clientSocketUser2.off("newDrawing", onNewDrawing);
        input.clientSocketUser2.on("erased", onErased);
        input.clientSocketUser1.emit("erase", eraseData);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    const onErased = (data: any) => {
      try {
        expect(data.boardId).toBe(eraseData.boardId);
        expect(data.shapeId).toBe(eraseData.shapeId);
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ erased event validated");

        input.clientSocketUser2.off("erased", onErased);
        input.clientSocketUser2.on("editedShape", onEditedShape);
        input.clientSocketUser1.emit("editShape", editShapeData);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    const onEditedShape = (data: any) => {
      try {
        expect(data.boardId).toBe(editShapeData.boardId);
        expect(data.shapeId).toBe(editShapeData.shapeId);
        expect(data.newColor).toBe(editShapeData.newColor);
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ editedShape event validated");

        input.clientSocketUser2.off("editedShape", onEditedShape);
        input.clientSocketUser2.on("clearedBoard", onClearedBoard);
        input.clientSocketUser1.emit("clearBoard", boardId);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    const onClearedBoard = (data: any) => {
      try {
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ clearedBoard event validated");

        input.clientSocketUser2.off("clearedBoard", onClearedBoard);
        clearTimeout(timeout);
        resolve();
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    // Start the test by emitting a draw event
    input.clientSocketUser2.on("newDrawing", onNewDrawing);
    input.clientSocketUser1.emit("draw", drawData);
  });
};
