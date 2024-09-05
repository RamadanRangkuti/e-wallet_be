import { Router } from "express";
import { getBalanceForLast7DaysHandler, getTransactions, makeTopUp, makeTransfer } from "../handlers/transaction.handler";
import { authorization } from "../middlewares/authorization";

const router = Router();

// Define route for getting transactions by user
router.get("/:id", authorization, getTransactions);
router.post("/transfer", authorization, makeTransfer);
router.post("/topup", authorization, makeTopUp);
router.get("/:id/balance/chart", authorization, getBalanceForLast7DaysHandler);

export default router;
