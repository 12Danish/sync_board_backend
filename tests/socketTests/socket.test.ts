import { io as Client } from "socket.io-client";
import request from "supertest";
import { registerAndLoginUser } from "../../utils/testUtils/authHelper";
import {
  addcollaboratorUtility,
  createBoardUtility,
} from "../../utils/testUtils/boardHelper";
import { searchUserUtility } from "../../utils/testUtils/userHelper";
import app from "../../server";
import { socketJoinRoomTester } from "./socketJoinRoom.testHelper";
import { httpServer } from "../setupTests";

import { socketCursorMovementTester } from "./socketCursorMovement.testHelper";
import { socketTextEventsTester } from "./socketTextEvents.testHelper";
import { socketDrawEventsTester } from "./socketDrawEvents.testHelper";

describe("Web socket tests", () => {
  let clientSocketUser1: any;
  let clientSocketUser2: any;
  let user1BoardId: any;
  beforeAll(async () => {
    let user1: any;

    let user2: any;
    const port = httpServer.address().port;

    const boardName = "socketTestBoard";

    user1 = await registerAndLoginUser({
      username: "alice",
      email: "alice@example.com",
      password: "secret1",
    });

    user2 = await registerAndLoginUser({
      username: "bob",
      email: "bob@example.com",
      password: "secret2",
    });

    user1BoardId = await createBoardUtility({
      name: boardName,
      security: "private",
      userToken: user1.cookies,
    });

    const user2SearchRes: any = await searchUserUtility({
      username: "bob",
      userToken: user1.cookies,
    });

    const user2_id = user2SearchRes._body[0]._id;

    const addUserRes = await addcollaboratorUtility({
      targetUser: user2_id,
      userToken: user1.cookies,
      boardId: user1BoardId,
      permission: "edit",
    });

    expect(addUserRes.status).toBe(201);

    const waitForConnection = (socket: any, label: string) =>
      new Promise<void>((resolve, reject) => {
        socket.on("connect", () => {
          console.log(`${label} connected`);
          resolve();
        });
        socket.on("connect_error", (err: any) => {
          console.error(`${label} connection error:`, err);
          reject(err);
        });
      });

    // Connect socket client with auth cookie
    clientSocketUser1 = Client(`http://localhost:${port}`, {
      extraHeaders: {
        Cookie: user1.cookies,
      },
      transports: ["websocket"],
    });

    await waitForConnection(clientSocketUser1, "Üser 1 connected");
    clientSocketUser2 = Client(`http://localhost:${port}`, {
      extraHeaders: {
        Cookie: user2.cookies,
      },
      transports: ["websocket"],
    });

    await waitForConnection(clientSocketUser2, "User 2 connected ");
  });

  it("Tests joining ", async () => {
    await socketJoinRoomTester({
      clientSocketUser1,
      clientSocketUser2,
      boardId: user1BoardId,
    });
  });

  it("Tests whether cursor movements are broadcasted properly", async () => {
    await socketCursorMovementTester({
      clientSocketUser1,
      clientSocketUser2,
      boardId: user1BoardId,
    });
  }, 30000);

  it("Tests text events", async () => {
    await socketTextEventsTester({
      clientSocketUser1,
      clientSocketUser2,
      boardId: user1BoardId,
    });
  });

  it("Tests drawing events", async () => {
    await socketDrawEventsTester({
      clientSocketUser1,
      clientSocketUser2,
      boardId: user1BoardId,
    });
  });

  afterAll(() => {
    clientSocketUser1.close();
    clientSocketUser2.close();
  });
});
