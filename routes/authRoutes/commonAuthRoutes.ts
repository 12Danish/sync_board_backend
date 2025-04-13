import express, { Router } from "express";

import { userLogout } from "../../controllers/authControllers/commonAuthControllers";
import { ValidationMiddleWare } from "../../middleware/authHandler";
const router: Router = express.Router();

router
  .route("/userLogout")
  .get(ValidationMiddleWare.validateToken(), userLogout);

export default router;
