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

export interface IRegisterBody extends IBody {
  password: string;
  pin: string;
}

export interface ILoginBody {
  email: string;
  password: string;
}