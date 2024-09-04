import { ParamsDictionary } from "express-serve-static-core";
import { IParams, IUserQuery } from "./user.model";
import { ITransactionParams } from "./transaction.model";

export type AppParams = ParamsDictionary | IParams | ITransactionParams;
export type QueryUserParams = IUserQuery;

export type CloudParams = ParamsDictionary;
