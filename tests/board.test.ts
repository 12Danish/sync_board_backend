import request from "supertest";
import app from "../server";
import { registerAndLoginUser } from "../utils/testUtils/authHelper";
import { searchUserUtility } from "../utils/testUtils/userHelper";
describe("Board routes test", () => {
  let user1: any;
  let user1Board: any;

  let user2: any;

  beforeAll(async () => {
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
  });

  it("This creates new private user board", async () => {
    const resp = await request(app)
      .post("/api/createBoard/")
      .set("Cookie", user1.cookies)
      .send({
        name: "board1",
        security: "private",
      });
    expect(resp.status).toBe(201);

    user1Board = resp.body._id;
  });

  it("adds a collaborator to a board", async () => {
    const user2SearchRes: any = await searchUserUtility({
      username: "bob",
      userToken: user1.cookies,
    });
    console.log("This is user2 ");
    console.log(user2SearchRes);
    const user2_id = user2SearchRes._body[0]._id;

    console.log("This is user2 id ");
    console.log(user2_id);
    const res = await request(app)
      .post(`/api/board/${user1Board}/collaborator`)
      .set("Cookie", user1.cookies)
      .send({
        targetUserId: user2_id,
        permission: "edit",
      });

    expect(res.status).toBe(201); // or the expected status code
    // Add more assertions here if needed
  });
});
