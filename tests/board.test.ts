import request from "supertest";
import app from "../server";
import { registerAndLoginUser } from "../utils/testUtils/authHelper";
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
    console.log(resp);
    user1Board = resp.body._id;
  });

  it("This add a collaboartor to a board", async () => {

    const resp = await request(app).post("")
  });
});
