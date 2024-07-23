import { ParamsDictionary } from "express-serve-static-core";
import { IParams, IUserQuery } from "./user.model";

export type AppParams = ParamsDictionary | IParams;
export type QueryUserParams = IUserQuery;