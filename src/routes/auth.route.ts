import { Router } from "express";

import { register, login } from "../handlers/auth.handler"

const router = Router();

router.post('/register', register);
router.post('/login', login);


export default router;