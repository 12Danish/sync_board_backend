import request from "supertest";
import app from "../server";

describe("Auth Routes", () => {
  it("should register the user", async () => {
    const resp = await request(app).post("/api/userRegister").send({
      username: "test123",
      email: "tests@gmail.com",
      password: "test",
    });

    expect(resp.status).toBe(201);
  });

  it("should login registered user and set cookies", async () => {
    const resp = await request(app).post("/api/userLogin").send({
      email: "tests@gmail.com",
      password: "test",
    });

    expect(resp.status).toBe(200);

    // ✅ Check if cookie is set
    const cookies = resp.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.length).toBeGreaterThan(0);
    console.log("Set-Cookie Header:", cookies);
  });
});
