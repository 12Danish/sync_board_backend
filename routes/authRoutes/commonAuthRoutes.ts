import express, { Router } from "express";

import { userLogout } from "../../controllers/authControllers/commonAuthControllers";

const router: Router = express.Router();

router.route("/userLogout").get(userLogout);

export { router };
