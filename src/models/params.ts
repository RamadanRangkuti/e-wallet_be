import { ParamsDictionary } from "express-serve-static-core";
import { IParams } from "./user.model";
import { ITransactionParams } from "./transaction.model";

export type AppParams = ParamsDictionary | IParams | ITransactionParams;