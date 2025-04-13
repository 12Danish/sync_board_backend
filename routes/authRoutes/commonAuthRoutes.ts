import express, { Router } from "express";

import {
  userLogout,
  getUserProfile,
} from "../../controllers/authControllers/commonAuthControllers";
import { ValidationMiddleWare } from "../../middleware/authHandler";
const router: Router = express.Router();

router
  .route("/userLogout")
  .get(ValidationMiddleWare.validateToken(), userLogout);

router
  .route("/userProfile")
  .get(ValidationMiddleWare.validateToken(), getUserProfile);
export default router;
