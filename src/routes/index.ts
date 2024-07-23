import { Router } from "express";

const router = Router();


import userRouter from "./user.route";
import authRouter from "./auth.route"

router.get('/', (req, res) => {
  return res.send("Backend For E-Wallet");
});

router.use('/user', userRouter);
router.use('/auth', authRouter);

export default router;