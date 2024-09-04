import { Router } from "express";

import { register, login, authPin } from "../handlers/auth.handler";
import { authorization } from "../middlewares/authorization";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/enterpin", authorization, authPin);

export default router;
