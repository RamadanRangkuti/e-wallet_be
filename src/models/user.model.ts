export interface IParams {
  id: string;
}
export interface dataUser {
  id: number;
  uuid: string;
  fullname?: string;
  email?: string;
  image?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface IBody {
  fullname: string;
  email?: string;
  password?: string;
  newpassword?: string;
  pin?: string;
  image?: string;
  phone?: string;
}
export interface IUser extends IBody {
  id: string,
  created_at: string,
  updated_at?: string | null;
}

export interface IDataUser extends IBody {
  id: number;
  uuid: string;
  created_at: string;
  updated_at: string | null;
}

export interface IUserQuery {
  fullname?: string;
  min_balance?: number;
  max_balance?: number;
  phone?: string;
  sortBy?: string;
  page?: string;
}

export interface IRegisterBody extends IBody {
  password: string;
  pin: string;
}

export interface ILoginBody {
  id: string;
  email: string;
  password: string;
}