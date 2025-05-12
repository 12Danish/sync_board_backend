import { socketEventsInput } from "../../utils/testUtils/joinBoardHelper";
import { joinRoom } from "../../utils/testUtils/joinBoardHelper";
export const socketDrawEventsTester = async (input: socketEventsInput) => {
  await joinRoom(input);
  console.log("Rooms joined for draw events");

  return new Promise<void>((resolve, reject) => {
    const boardId = input.boardId;
    const pageNumber = 1;

    const drawData = {
      boardId,
      updatedBoardPage: {
        pageNumber,
        whiteBoardObjects: {
          type: "rectangle",
          x: 10,
          y: 20,
          width: 100,
          height: 50,
        },
      },
    };

    console.log("drawdata");
    console.log(drawData);

    const eraseData = {
      boardId,
      updatedBoardPage: {
        pageNumber,
        whiteBoardObjects: { id: "object-123" },
      },
    };

    const editShapeData = {
      boardId,
      updatedBoardPage: {
        pageNumber,
        whiteBoardObjects: {
          id: "object-123",
          color: "red",
        },
      },
    };

    const clearPageData = {
      boardId,
      updatedBoardPage: {
        pageNumber,
        whiteBoardObjects: {},
      },
    };

    const timeout = setTimeout(() => {
      reject(new Error("One or more draw events were not received in time"));
    }, 30000);

    const onNewDrawing = (data: any) => {
      try {
        expect(data.boardId).toBe(drawData.boardId);
        // Access updatedBoardPage instead of expecting pageNumber at the root level
        expect(data.updatedBoardPage.pageNumber).toBe(
          drawData.updatedBoardPage.pageNumber
        );
        expect(data.updatedBoardPage.whiteBoardObjects).toEqual(
          drawData.updatedBoardPage.whiteBoardObjects
        );
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ newDrawing event validated");

        input.clientSocketUser2.off("newDrawing", onNewDrawing);
        resolve();
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
        expect(data.updatedBoardPage.pageNumber).toBe(
          eraseData.updatedBoardPage.pageNumber
        );
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
        expect(data.updatedBoardPage.pageNumber).toBe(
          editShapeData.updatedBoardPage.pageNumber
        );
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ editedShape event validated");

        input.clientSocketUser2.off("editedShape", onEditedShape);
        input.clientSocketUser2.on("clearedPage", onClearedPage);
        input.clientSocketUser1.emit("clearPage", clearPageData);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    const onClearedPage = (data: any) => {
      try {
        expect(data.boardId).toBe(clearPageData.boardId);
        expect(data.userEmail).toBeDefined();
        expect(data.userId).toBeDefined();
        console.log("✔️ clearedPage event validated");

        input.clientSocketUser2.off("clearedPage", onClearedPage);
        clearTimeout(timeout);
        resolve();
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    // Start the test by emitting a draw event with new structure
    input.clientSocketUser2.on("newDrawing", onNewDrawing);
    input.clientSocketUser1.emit("draw", drawData);
  });
};
