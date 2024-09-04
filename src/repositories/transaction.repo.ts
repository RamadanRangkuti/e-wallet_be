import db from "../../src/configs/connection";
import { QueryResult } from "pg";
import { IDataTransaction, ITopUpData, ITransferData } from "../models/transaction.model";

export const getTransactionsByUser = (id: number, searchQuery?: string): Promise<QueryResult<IDataTransaction>> => {
  let query = `
    SELECT 
      t.type,
      t.status,
      t.created_at,
      t.updated_at,
      tr.sender_id,
      sender.image AS sender_image,
      sender.fullname AS sender_fullname,
      sender.phone AS sender_phone,
      tr.receiver_id,
      receiver.image AS receiver_image,
      receiver.fullname AS receiver_fullname,
      receiver.phone AS receiver_phone,
      tr.amount AS transfer_amount,
      tr.notes,
      tp.user_id,
      p.method,
      tp.amount AS top_up_amount,
      tp.admin,
      tp.total_amount
    FROM transactions t
    LEFT JOIN transfers tr ON t.id = tr.transaction_id
    LEFT JOIN top_ups tp ON t.id = tp.transaction_id
    LEFT JOIN payments p ON tp.payment_id = p.id
    LEFT JOIN users sender ON tr.sender_id = sender.id
    LEFT JOIN users receiver ON tr.receiver_id = receiver.id
    WHERE tr.sender_id = $1 OR tr.receiver_id = $1 OR tp.user_id = $1
  `;

  const values: (number | string)[] = [id];

  if (searchQuery) {
    query += ` AND (receiver.fullname ILIKE $2 OR receiver.phone ILIKE $2 OR sender.fullname ILIKE $2 OR sender.phone ILIKE $2)`;
    values.push(`%${searchQuery}%`);
  }

  return db.query(query, values);
};

// Perform a transfer
export const performTransfer = async (transfer: ITransferData): Promise<{ transactionId: number }> => {
  const { sender_id, receiver_id, amount, notes } = transfer;

  const insertTransactionQuery = `
    INSERT INTO transactions (type, status) 
    VALUES ('Transfer', 'Success') 
    RETURNING id
  `;

  const insertTransferQuery = `
    INSERT INTO transfers (transaction_id, sender_id, receiver_id, amount, notes) 
    VALUES ($1, $2, $3, $4, $5)
  `;

  const updateSenderBalanceQuery = `
    UPDATE users SET balance = balance - $1 WHERE id = $2
  `;

  const updateReceiverBalanceQuery = `
    UPDATE users SET balance = balance + $1 WHERE id = $2
  `;

  const getSenderBalanceQuery = `
    SELECT balance FROM users WHERE id = $1
  `;

  try {
    await db.query("BEGIN");

    // Check sender balance
    const senderBalanceResult = await db.query(getSenderBalanceQuery, [sender_id]);
    const senderBalance = senderBalanceResult.rows[0].balance;

    if (senderBalance < amount || senderBalance - amount < 0) {
      throw new Error("Your balance is not enough, please top up!");
    }

    const transactionResult = await db.query(insertTransactionQuery);
    const transactionId = transactionResult.rows[0].id;

    await db.query(insertTransferQuery, [transactionId, sender_id, receiver_id, amount, notes]);
    await db.query(updateSenderBalanceQuery, [amount, sender_id]);
    await db.query(updateReceiverBalanceQuery, [amount, receiver_id]);

    await db.query("COMMIT");

    return { transactionId };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
};

// Perform a top-up
export const performTopUp = async (topUp: ITopUpData): Promise<{ transactionId: number }> => {
  const insertTransactionQuery = `
    INSERT INTO transactions (type, status) 
    VALUES ('Topup', 'Success') 
    RETURNING id
  `;

  const insertTopUpQuery = `
    INSERT INTO top_ups (transaction_id, user_id, payment_id, amount, admin, total_amount) 
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  const updateUserBalanceQuery = `
    UPDATE users SET balance = balance + $1 WHERE id = $2
  `;

  const { user_id, payment_id, amount, admin = 0 } = topUp; // Default admin to 0 if not provided
  const totalAmount = amount + admin; // Calculate total amount including admin

  try {
    await db.query("BEGIN");

    // Insert transaction and get transaction ID
    const transactionResult = await db.query(insertTransactionQuery);
    const transactionId = transactionResult.rows[0].id;

    // Insert top-up details
    await db.query(insertTopUpQuery, [transactionId, user_id, payment_id, amount, admin, totalAmount]);

    // Update user balance
    await db.query(updateUserBalanceQuery, [amount, user_id]);

    await db.query("COMMIT");

    return { transactionId };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
};

// Get balance for the last 7 days
export const getBalanceForLast7Days = (id: number): Promise<QueryResult<IDataTransaction>> => {
  const query = `
        WITH date_series AS (
            SELECT generate_series(
                date_trunc('day', NOW() - INTERVAL '6 days'), 
                date_trunc('day', NOW()), 
                '1 day'::interval
            ) AS date
        ),
        transactions_summary AS (
            SELECT
                date_trunc('day', t.created_at) AS date,
                SUM(CASE 
                    WHEN t.type = 'Transfer' AND tr.receiver_id = $1 THEN tr.amount 
                    WHEN t.type = 'Topup' AND tp.user_id = $1 THEN tp.total_amount
                    ELSE 0 
                END) AS balance_in,
                SUM(CASE WHEN t.type = 'Transfer' AND tr.sender_id = $1 THEN tr.amount ELSE 0 END) AS balance_out
            FROM transactions t
            LEFT JOIN transfers tr ON t.id = tr.transaction_id
            LEFT JOIN top_ups tp ON t.id = tp.transaction_id
            WHERE (tr.sender_id = $1 OR tr.receiver_id = $1 OR tp.user_id = $1) 
                AND t.created_at >= NOW() - INTERVAL '7 days'
            GROUP BY date
        )
        SELECT 
            ds.date,
            COALESCE(ts.balance_in, 0) AS balance_in,
            COALESCE(ts.balance_out, 0) AS balance_out
        FROM date_series ds
        LEFT JOIN transactions_summary ts ON ds.date = ts.date
        ORDER BY ds.date;
    `;

  const values = [id];
  return db.query(query, values);
};
