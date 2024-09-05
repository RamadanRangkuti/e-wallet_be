import { Request, Response } from "express-serve-static-core";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { ILoginBody, IPinAuth, IRegisterBody } from "../models/user.model";
import { loginUser, pinAuth, registerUser } from "../repositories/auth.repo";
import { IAuthResponse, IBasicResponse } from "../models/response.model";
import { IPayload } from "../models/payload.model";
import { jwtOptions } from "../middlewares/authorization";

export const register = async (req: Request<{}, {}, IRegisterBody, {}>, res: Response) => {
  try {
    const { password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPw = await bcrypt.hash(password, salt);
    const result = await registerUser(req.body, hashedPw);
    return res.status(201).json({
      msg: "Success",
      data: result.rows,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

export const login = async (req: Request<{}, {}, ILoginBody, {}>, res: Response<IAuthResponse>) => {
  const { email, password } = req.body

  try {
    const { email, password } = req.body;
    const result = await loginUser(email);
    if (email.length <= 0 || password.length <= 0) throw new Error("Email or Password required!!!");
    if (!result.rows.length) throw new Error("Username or password is wrong!!!");
    const { password: hash, id } = result.rows[0];
    const isValid = await bcrypt.compare(password, hash);
    if (!isValid) throw new Error("Username or password is wrong!!!");

    const payload: IPayload = {
      id,
      email,
    };
    const token = jwt.sign(payload, <string>process.env.JWT_KEY, jwtOptions);
    return res.status(200).json({
      msg: `Selamat datang ${email} `,
      data: [{ token }],
    });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(401).json({
        msg: "Error",
        err: err.message,
      });
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

export const authPin = async (req: Request<{}, {}, IPinAuth, {}>, res: Response<IBasicResponse>) => {
  const { id, pin } = req.body;
  try {
    const result = await pinAuth(id);
    if (!pin) throw new Error("Pin is required!!!");
    const { pin: hash } = result.rows[0];
    const isValid = await bcrypt.compare(pin, hash);
    if (!isValid) throw new Error("Wrong Pin!!!");

    return res.status(200).json({
      msg: `Success`,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err);
      return res.status(401).json({
        msg: "Error",
        err: err.message,
      });
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

// export const login = async (req: Request<{}, {}, ILoginBody, {}>, res: Response<IAuthResponse>) => {
//   const { email, password } = req.body;
//   try {
//     const result = await loginUser(email);
//     if (email.length <= 0 || password.length <= 0) throw new Error("Email or Password required!!!");
//     if (!result.rows.length) throw new Error("Username or password is wrong!!!");
//     const { password: hash, fullname, id, role } = result.rows[0];
//     const isValid = await bcrypt.compare(password, hash);
//     if (!isValid) throw new Error("Username or password is wrong!!!");
//     const payload: IPayload = {
//       id,
//       fullname,
//       role,
//     };
//     const token = jwt.sign(payload, <string>process.env.JWT_KEY, jwtOptions);
//     return res.status(200).json({
//       msg: `Selamat datang ${fullname}!`,
//       data: [{ token }]
//     })
//   } catch (error) {
//     // if (error instanceof Error) {
//     //   if (/(invalid(.)+uuid(.)+)/g.test(error.message)) {
//     //     return res.status(401).json({
//     //       msg: "Error",
//     //       err: "Username or password is wrong!!!",
//     //     });
//     //   }
//     //   console.log(error.message);
//     // }
//     // return res.status(500).json({
//     //   msg: "Error",
//     //   err: "Internal Server Error",
//     // });
//     if (error instanceof Error) {
//       return res.status(401).json({
//         msg: "Error",
//         err: error.message
//       })
//     }
//     return res.status(500).json({
//       msg: "Error",
//       err: "Internal Server Error"
//     })
//   }
// }
