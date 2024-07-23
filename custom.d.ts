import * as express from "express-serve-static-core";
import { IPayload } from "./src/models/payload.model";

declare global {
  namespace Express {
    export interface Request {
      userPayload?: IPayload | string | number;
    }
  }
}