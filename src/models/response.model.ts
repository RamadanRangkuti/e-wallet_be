import { IUser } from "./user.model";

interface IPaginationMeta {
  totalData?: number;
  totalPage?: number;
  page: number;
  prevLink: string | null;
  nextLink: string | null;
}

export interface IBasicResponse {
  msg: string,
  data?: any[];
  err?: string;
};

export interface IUserResponse extends IBasicResponse {
  data?: IUser[];
};

export interface IAuthResponse extends IBasicResponse {
  data?: { token: string }[];
}