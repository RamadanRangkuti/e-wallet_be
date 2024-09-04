import { QueryResult } from "pg";
import db from "../configs/connection";
import { IBody, IUser } from "../models/user.model";

export const registerUser = (body: IBody, hashedPassword: string): Promise<QueryResult<IUser>> => {
  const query = `INSERT INTO users (email, password)
  values($1,$2) returning email`;
  const { email } = body;
  const values = [email, hashedPassword];
  return db.query(query, values);
};

export const loginUser = (email: string): Promise<QueryResult<{ fullname: string; id: string; password: string }>> => {
  const query = `SELECT id, fullname, password from users WHERE email = $1`;
  const values = [email];
  return db.query(query, values);
};

export const pinAuth = (id: string): Promise<QueryResult<{ pin: string }>> => {
  const query = `SELECT pin from users WHERE id = $1`;
  const values = [id];
  return db.query(query, values);
};
