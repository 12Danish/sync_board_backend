import express, { Router } from "express";

import { firebaseLogin } from "../../controllers/authControllers/firebaseAuthController";

const router: Router = express.Router();

router.route("/firebaseLogin").post(firebaseLogin);

export default router;
