export interface IParams {
  id: string;
}

export interface IBody {
  fullname: string;
  email?: string;
  password?: string;
  pin?: string;
  image?: string;
  phone?: string;
}
export interface IUser extends IBody {
  id: string,
  created_at: string,
  updated_at?: string | null;
}

export interface IDataUser extends IBody{
  id: number;
  uuid: string;
  created_at: string;
  updated_at: string | null;
}

export interface IUserQuery extends IDataUser{
  min_balance?: number;
  max_balance?: number;
  phone?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}