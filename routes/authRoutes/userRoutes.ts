import express, { Router } from "express";

import {
  userLogin,
  userRegister,
  updateUserProfile,
} from "../../controllers/authControllers/userAuthControllers";
import { ValidationMiddleWare } from "../../middleware/authHandler";
const router: Router = express.Router();

router
  .route("/userRegister")
  .post(ValidationMiddleWare.validateLocalRegisterInput(), userRegister);

router
  .route("/userLogin")
  .post(ValidationMiddleWare.validLocalLoginInput(), userLogin);
router
  .route("/userProfile")
  .put(
    ValidationMiddleWare.validateToken(),
    ValidationMiddleWare.validateLocalUserUpdate(),
    updateUserProfile
  );

export default router;
