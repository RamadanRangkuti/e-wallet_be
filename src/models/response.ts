import { IDataTransaction, ITopUpData, ITransferData } from "./transaction.model";

interface IBasicResponse {
    msg: string;
    data?: unknown[];
    err?: string;
}

export interface ITransactionResponse extends IBasicResponse {
    data?: IDataTransaction[];
}

export interface ITransferResponse extends IBasicResponse {
    data?: ITransferData[];
}

export interface ITopupResponse extends IBasicResponse {
    data?: ITopUpData[];
}