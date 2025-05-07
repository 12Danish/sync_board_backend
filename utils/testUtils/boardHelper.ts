import request from "supertest";

import app from "../../server";

interface addCollaboratorInput {
  targetUser: string;
  userToken: any;
  boardId: string;
  permission: "edit" | "view";
}

interface userCreateBoardInput {
  userToken: any;
  name: string;
  security: "private" | "public";
}
const createBoardUtility = async (input: userCreateBoardInput) => {
  const resp = await request(app)
    .post("/api/createBoard/")
    .set("Cookie", input.userToken)
    .send({
      name: input.name,
      security: input.security,
    });

    return resp.body._id;


};
const getBoardsUtility = async (userToken: any) => {
  const res = await request(app).get("/api/getBoards").set("Cookie", userToken);
  return res;
};
const addcollaboratorUtility = async (input: addCollaboratorInput) => {
  const res = await request(app)
    .post(`/api/board/${input.boardId}/collaborator`)
    .set("Cookie", input.userToken)
    .send({
      targetUserId: input.targetUser,
      permission: input.permission,
    });

  return res;
};

export { addcollaboratorUtility, getBoardsUtility, createBoardUtility };
