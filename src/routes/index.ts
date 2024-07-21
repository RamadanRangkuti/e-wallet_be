import { Router } from "express";

const router = Router();


import userRouter from "./user.route";

router.get('/', (req, res) => {
  return res.send("Backend For E-Wallet");
});

router.use('/user', userRouter);

export default router;