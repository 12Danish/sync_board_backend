import request from "supertest";
import app from "../server";
import { registerAndLoginUser } from "../utils/testUtils/authHelper";
describe("Board routes test", () => {
  let user1: any;
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

  it("This creates new user board")
});
