import { Request, Response, NextFunction } from "express-serve-static-core";
import jwt, { SignOptions } from "jsonwebtoken";
import { AppParams } from "../models/params";
import { IAuthResponse } from "../models/response.model";


export const jwtOptions: SignOptions = {
  expiresIn: "1d",
  issuer: process.env.JWT_ISSUER
}

export const authorization = (req: Request<AppParams>, res: Response<IAuthResponse>, next: NextFunction) => {
  const bearerToken = req.header("Authorization");
  console.log(bearerToken);
  if (!bearerToken) {
    return res.status(403).json({
      msg: "Forbidden",
      err: "Don't Have access"
    })
  }
  const token = bearerToken.split(" ")[1];

  jwt.verify(token, <string>process.env.JWT_KEY, jwtOptions, (err, payload) => {
    if (err) {
      return res.status(403).json({
        msg: err.message,
        err: err.name
      })
    }
    req.userPayload = payload
    next();
  })
}