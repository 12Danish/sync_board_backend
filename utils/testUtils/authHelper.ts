import request from "supertest";
import app from "../../server";
interface UserCredentials {
  username: string;
  email: string;
  password: string;
}

const registerAndLoginUser = async (user: UserCredentials) => {
  await request(app).post("/api/userRegister").send(user);
  // Login
  const loginResp = await request(app).post("/api/userLogin").send({
    email: user.email,
    password: user.password,
  });

  if (loginResp.status !== 200) {
    throw new Error(`Login failed for ${user.email}`);
  }

  const cookies = loginResp.headers["set-cookie"];
  return {
    cookies,
    user,
  };
};

export { registerAndLoginUser };
