import { QueryResult } from "pg";
import db from "../configs/connection";
import { IUser, IBody, IUserQuery } from "../models/user.model";

export const getAllUsers = (que: IUserQuery): Promise<QueryResult<IUser>> => {
  const limit = 8;
  const { fullname, page = "1", sortBy } = que;
  const values: any[] = [];
  const conditions: string[] = [];
  
  let query = `SELECT id, fullname, email, phone, balance, image FROM users`;

  // const { fullname, min_balance, max_balance, phone, sortBy, page } = que;
  // const values: any[] = [];
  // const conditions: string[] = [];

  if (fullname) {
    conditions.push(`(fullname ILIKE $${values.length + 1} OR phone ILIKE $${values.length + 1})`);
    values.push(`%${fullname}%`);
  }
  // Uncomment and adjust these conditions as necessary
  // if (min_balance) {
  //   conditions.push(`balance > $${values.length + 1}`);
  //   values.push(min_balance);
  // }
  // if (max_balance) {
  //   conditions.push(`balance < $${values.length + 1}`);
  //   values.push(max_balance);
  // }
  // if (phone) {
  //   conditions.push(`phone = $${values.length + 1}`);
  //   values.push(phone);
  // }

  conditions.push(`fullname IS NOT NULL`);
  conditions.push(`phone IS NOT NULL`);

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  switch (sortBy) {
    case "alphabet":
      query += " ORDER BY fullname ASC";
      break;
    // Uncomment and adjust these sorting conditions as necessary
    // case "balance":
    //   query += " ORDER BY balance ASC";
    //   break;
    // case "latest":
    //   query += " ORDER BY created_at DESC";
    //   break;
    // case "oldest":
    //   query += " ORDER BY created_at ASC";
    //   break;
    default:
      query += " ORDER BY id ASC"; // Default sorting if sortBy is not specified
      break;
  }
  
  const offset = (parseInt(page) - 1) * limit;
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  console.log("Query:", query);
  console.log("Values:", values);

  return db.query(query, values);
};

export const getTotalUser = async ({ fullname = "" }: IUserQuery): Promise<{ rowCount: number; rows: { total_user: string }[] }> => {
  let query = `SELECT COUNT(*) as total_user FROM users WHERE fullname IS NOT NULL AND phone IS NOT NULL`;
  const values: any[] = [];

  if (fullname) {
    query += ` AND (fullname ILIKE $${values.length + 1} OR phone ILIKE $${values.length + 1})`;
    values.push(`%${fullname}%`);
  }

  console.log("Query:", query);
  console.log("Values:", values);

  const result = await db.query(query, values);
  const rowCount = result.rowCount !== null ? result.rowCount : 0;

  return {
    rowCount,
    rows: result.rows
  };
};

export const getDetailUser = (id: string): Promise<QueryResult<IUser>> => {
  let query = `SELECT fullname, email, balance, phone, image, password, pin FROM users WHERE id=$1`;
  const value = [id];
  return db.query(query, value);
};

export const addUser = (body: IBody): Promise<QueryResult<IUser>> => {
  const query = `INSERT INTO users (fullname, email, password, image, pin, phone) values ($1,$2,$3,$4,$5,$6) returning *`;
  const { fullname, email, password, image, pin, phone } = body;
  const values = [fullname, email, password, pin, image, phone];
  return db.query(query, values);
};

export const updateUser = (body: IBody, id: string, imgUrl?: string): Promise<QueryResult<IUser>> => {
  let query = `UPDATE users SET `;
  let fields: string[] = [];
  let values: (string | number | null)[] = [];

  const { fullname, email, phone } = body;

  if (fullname) {
    fields.push(`fullname = $${fields.length + 1}`);
    values.push(fullname);
  }

  if (email) {
    fields.push(`email = $${fields.length + 1}`);
    values.push(email);
  }
  if (imgUrl) {
    fields.push(`image = $${fields.length + 1}`);
    values.push(imgUrl);
  }

  if (phone) {
    fields.push(`phone = $${fields.length + 1}`);
    values.push(phone);
  }

  fields.push(`updated_at = now()`);

  query += fields.join(", ");

  const idNumber = values.length + 1;
  query += ` WHERE id = $${idNumber} returning *`;
  values.push(id);

  return db.query(query, values);
};

export const updatePin = (id: string, hashedPin: string): Promise<QueryResult<IUser>> => {
  const query = `UPDATE users SET pin = $1 WHERE id = $2 RETURNING *`;
  const values = [hashedPin, id];
  return db.query(query, values);
};

export const updatePass = (id: string, hashedPassword: string): Promise<QueryResult<IUser>> => {
  const query = `UPDATE users SET password = $1 WHERE id = $2 RETURNING *`;
  const values = [hashedPassword, id];
  return db.query(query, values);
};

export const deleteImage = (id: string): Promise<QueryResult<IUser>> => {
  const query = `UPDATE users SET image = NULL WHERE id = $1 RETURNING *`;
  const values = [id];
  return db.query(query, values);
};

export const deleteUser = (id: string): Promise<QueryResult<IUser>> => {
  const query = `DELETE FROM users WHERE id=$1 returning *`;
  const value = [id];
  return db.query(query, value);
};
