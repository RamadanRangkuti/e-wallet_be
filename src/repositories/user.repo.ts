import { QueryResult } from "pg";
import db from "../configs/connection";
import { IUser, IBody } from "../models/user.model";

export const getUser = (): Promise<QueryResult<IUser>> => {
  let query = `SELECT fullname, email, phone, image FROM users`;

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