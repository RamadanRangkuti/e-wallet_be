import { Request, Response } from "express";
import { getBalanceForLast7Days, getTransactionsByUser, performTopUp, performTransfer } from "../repositories/transaction.repo";
import { ITopUpData, ITransactionParams, ITransferData } from "../models/transaction.model";
import { ITransactionResponse } from "../models/response.model";

export const getTransactions = async (req: Request<ITransactionParams>, res: Response<ITransactionResponse>) => {
  try {
    const { id } = req.params;
    const searchQuery = req.query.search as string;
    const result = await getTransactionsByUser(id, searchQuery);

    if (result.rows.length === 0) {
      return res.status(404).json({
        msg: "No transactions found for this user",
        data: [],
      });
    }

    return res.status(200).json({
      msg: "Success",
      data: result.rows,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const searchQuery = req.query.search as string | undefined;
    const result = await getTransactionsByUser(userId, searchQuery);
    if (result.rows.length === 0) {
      return res.status(404).json({
        msg: "No Transactions Found",
        data: [],
      });
    }
    return res.status(200).json({
      msg: "Success",
      data: result.rows,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

// Handler to perform a transfer
export const makeTransfer = async (req: Request, res: Response) => {
  try {
    const transfer: ITransferData = req.body;
    const result = await performTransfer(transfer);
    return res.status(201).json({
      msg: "Transfer Successful",
      transactionId: result.transactionId,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      if (err.message === "Your balance is not enough, please top up!") {
        return res.status(400).json({
          msg: "Error",
          err: "Your balance is not enough, please top up!",
        });
      }
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

// Handler to perform a top-up
export const makeTopUp = async (req: Request, res: Response) => {
  try {
    const topUp: ITopUpData = req.body;
    const result = await performTopUp(topUp);
    return res.status(201).json({
      msg: "Top-Up Successful",
      transactionId: result.transactionId,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

// Handler to get balance for last 7 days
export const getBalanceForLast7DaysHandler = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await getBalanceForLast7Days(id);
    if (result.rows.length === 0) {
      return res.status(404).json({
        msg: "No Data Found",
        data: [],
      });
    }
    return res.status(200).json({
      msg: "Success",
      data: result.rows,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};
