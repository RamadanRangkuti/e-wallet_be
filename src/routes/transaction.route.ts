import { Router } from 'express';
import { getBalanceForLast7DaysHandler, getTransactions, makeTopUp, makeTransfer } from '../handlers/transaction.handler';

const router = Router();

// Define route for getting transactions by user
router.get('/:id', getTransactions);
router.post('/transfer', makeTransfer);
router.post('/topup', makeTopUp);
router.get('/:id/balance/chart', getBalanceForLast7DaysHandler);

export default router;