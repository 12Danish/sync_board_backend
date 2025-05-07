import request from "supertest";
import app from "../../server";

interface userSearchInput {
  username?: string;
  email?: string;
  userToken: any;
}

const searchUserUtility = async (searchDetails: userSearchInput) => {
  let url = "/api/user/search/";

  if (searchDetails.email && searchDetails.username) {
    url += `?username=${searchDetails.username}?email=${searchDetails.email}`;
  } else if (searchDetails.username && !searchDetails.email) {
    url += `?username=${searchDetails.username}`;
  } else if (searchDetails.email && !searchDetails.username) {
    url += `?email=${searchDetails.email}`;
  }

  const searchRes = await request(app)
    .get(url)
    .set("Cookie", searchDetails.userToken);

  return searchRes;
};

export { searchUserUtility };
