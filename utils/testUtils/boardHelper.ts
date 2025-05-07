import request from "supertest";

import app from "../../server";

interface addCollaboratorInput {
  targetUser: string;
  userToken: any;
  boardId: string;
  permission: "edit" | "string";
}

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

export { addcollaboratorUtility };
