import { io as Client } from "socket.io-client";
import request from "supertest";
import { registerAndLoginUser } from "../../utils/testUtils/authHelper";
import {
  addcollaboratorUtility,
  createBoardUtility,
} from "../../utils/testUtils/boardHelper";
import { searchUserUtility } from "../../utils/testUtils/userHelper";
import app from "../../server";
import { httpServer } from "../setupTests";
describe("Web socket tests", () => {
  let clientSocketUser1: any;
  let clientSocketUser2: any;

  beforeAll(async () => {
    let user1: any;
    let user1BoardId: any;
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

    console.log(user2SearchRes);
    const user2_id = user2SearchRes._body[0]._id;

    const addUserRes = await addcollaboratorUtility({
      targetUser: user2_id,
      userToken: user1.cookies,
      boardId: user1BoardId,
      permission: "edit",
    });

    expect(addUserRes.status).toBe(200);

    // Connect socket client with auth cookie
    clientSocketUser1 = Client(`http://localhost:${port}`, {
      extraHeaders: {
        Cookie: user1.cookies,
      },
      transports: ["websocket"],
    });

    await new Promise((resolve) => {
      clientSocketUser1.on("connect", resolve);
    });
    clientSocketUser2 = Client(`http://localhost:${port}`, {
      extraHeaders: {
        Cookie: user2.cookies,
      },
      transports: ["websocket"],
    });

    await new Promise((resolve) => {
      clientSocketUser2.on("connect", resolve);
    });
  });

  afterAll(() => {
    clientSocketUser1.close();
    clientSocketUser2.close();
  });
});
