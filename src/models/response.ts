import { IDataTransaction, ITopUpData, ITransferData } from "./transaction.model";
import { IUser } from "./user.model";

export interface ITransactionResponse extends IBasicResponse {
  data?: IDataTransaction[];
}

export interface ITransferResponse extends IBasicResponse {
  data?: ITransferData[];
}

export interface ITopupResponse extends IBasicResponse {
  data?: ITopUpData[];
}

interface IPaginationMeta {
  totalData?: number;
  totalPage?: number;
  page: number;
  prevLink: string | null;
  nextLink: string | null;
}

export interface IBasicResponse {
  msg: string;
  data?: any[];
  err?: string;
  meta?: IPaginationMeta;
}

export interface IUserResponse extends IBasicResponse {
  data?: IUser[];
}
