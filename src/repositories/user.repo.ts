import { QueryResult } from "pg";
import db from "../configs/connection";
import { IUser, IBody, IUserQuery } from "../models/user.model";


export const getAllUsers = (que: IUserQuery): Promise<QueryResult<IUser>> => {
  let query = `SELECT fullname, email, phone, balance FROM users`;
  const { fullname, min_balance, max_balance, phone, sortBy, page } = que;
  const values = [];
  let condition = false;

  if (fullname) {
    query += ` WHERE fullname ILIKE $${values.length + 1}
    OR phone ILIKE $${values.length + 1}`;
    values.push(`%${fullname}%`);
    condition = true;
  }
  // if (min_balance) {
  //   query += condition ? " AND " : " WHERE ";
  //   query += ` balance > $${values.length + 1}`;
  //   values.push(min_balance);
  //   condition = true;
  // }
  // if (max_balance) {
  //   query += condition ? " AND " : " WHERE ";
  //   query += ` balance < $${values.length + 1}`;
  //   values.push(max_balance);
  //   condition = true;
  // }
  if (phone) {
    query += condition ? " AND " : " WHERE ";
    query += ` phone = $${values.length + 1}`;
    values.push(phone);
    condition = true;
  }

  switch (sortBy) {
    case "alphabet":
      query += " ORDER BY fullname ASC";
      break;
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
      query += " ORDER BY id ASC"; // Default sorting jika tidak disebutkan sortBy
      break;
  }

  if (page) {
    const offset = (parseInt(page.toString()) - 1) * 5;
    query += ` LIMIT 8 OFFSET $${values.length + 1}`;
    values.push(offset);
  }
  return db.query(query, values);
};

export const getTotalUser = async (): Promise<{ rows: { total_user: string }[] }> => {
  const query = `SELECT COUNT(*) AS total_user FROM users`;
  return db.query(query);
};

export const getDetailUser = (id: string): Promise<QueryResult<IUser>> => {
  let query = `SELECT fullname, email, phone, image FROM users WHERE id=$1`;
  const value = [id];
  console.log(query);
  return db.query(query, value);
};


export const addUser = (body: IBody): Promise<QueryResult<IUser>> => {
  const query = `INSERT INTO users (fullname, email, password, image, pin, phone) values ($1,$2,$3,$4,$5,$6) returning *`;
  const { fullname, email, password, image, pin, phone } = body;
  const values = [fullname, email, password, pin, image, phone];
  return db.query(query, values);
}

export const updateUser = (id: string, body: IBody): Promise<QueryResult<IUser>> => {
  let query = `UPDATE users SET `;
  let fields: string[] = [];
  let values: (string | number | null)[] = [];

  const { fullname, email, image, pin, phone } = body;

  if (fullname) {
    fields.push(`fullname = $${fields.length + 1}`);
    values.push(fullname);
  }

  if (email) {
    fields.push(`email = $${fields.length + 1}`);
    values.push(email);
  }


  if (image) {
    fields.push(`image = $${fields.length + 1}`);
    values.push(image);
  }

  if (pin) {
    fields.push(`pin = $${fields.length + 1}`);
    values.push(pin);
  }

  if (phone) {
    fields.push(`phone = $${fields.length + 1}`);
    values.push(phone);
  }


  fields.push(`updated_at = now()`);

  query += fields.join(', ');

  const idNumber = values.length + 1;
  query += ` WHERE id = $${idNumber} returning *`;
  values.push(id);

  return db.query(query, values);
};

export const deleteUser = (id: string): Promise<QueryResult<IUser>> => {
  const query = `DELETE FROM users WHERE id=$1 returning *`;
  const value = [id];
  return db.query(query, value);
};