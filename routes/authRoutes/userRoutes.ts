import express, { Router } from "express";

import {
  userLogin,
  userRegister,
  getUserProfile,
  updateUserProfile,
} from "../../controllers/authControllers/userAuthControllers";
import { ValidationMiddleWare } from "../../middleware/authHandler/userAuthHandler";
const router: Router = express.Router();

router
  .route("/userRegister")
  .post(ValidationMiddleWare.validateRegisterInput(), userRegister);

router
  .route("/userLogin")
  .post(ValidationMiddleWare.validLoginInput(), userLogin);
router.route("/userProfile").get(getUserProfile).put(updateUserProfile);

export default router;
