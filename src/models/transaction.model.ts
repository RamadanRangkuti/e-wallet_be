import { Request } from 'express';

export interface ITransactionParams {
    id: number;
  }

export interface IDataTransaction {
    id: number;
    uuid: string;
    type: 'Transfer' | 'Topup';
    status: 'Pending' | 'Success' | 'Failed';
    created_at: string;
    updated_at?: string;
    sender_id?: number;
    sender_fullname?: string;
    sender_phone?: string;
    receiver_id?: number;
    receiver_fullname?: string;
    receiver_phone?: string;
    transfer_amount?: number;
    notes?: string;
    user_id?: number;
    method?: 'BRI' | 'BCA' | 'DANA' | 'GoPay' | 'OVO';
    top_up_amount?: number;
    admin?: number;
    total_amount?: number;
  }
  
  export interface ITransferData extends IDataTransaction {
    sender_id: number;
    receiver_id: number;
    amount: number;
    notes?: string;
  }
  
  export interface ITopUpData extends IDataTransaction {
    user_id: number;
    payment_id: number;
    amount: number;
    admin?: number;
    total_amount: number;
  }
  
  export interface ITransferRequest extends Request {
    body: ITransferData;
  }
  
  export interface ITopUpRequest extends Request {
    body: ITopUpData;
  }