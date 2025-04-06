import express, { Router } from "express";

import {
  userLogin,
  userRegister,
  getUserProfile,
  updateUserProfile,
} from "../../controllers/authControllers/userAuthControllers";

const router: Router = express.Router();

router.route("/userRegister").post(userRegister);
router.route("/userLogin").post(userLogin);
router.route("/userProfile").get(getUserProfile).put(updateUserProfile);

export { router };
