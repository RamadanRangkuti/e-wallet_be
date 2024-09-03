import { RequestHandler } from "express";
import { NextFunction, Request, Response } from "express-serve-static-core";
import multer, { Field, memoryStorage, Options, StorageEngine } from "multer";
import path from "path";
import { CloudParams } from "../models/params";
import { IAuthResponse } from "../models/response.model";

const multerDisk = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    const extName = path.extname(file.originalname);
    const newFileName = `image-${Date.now()}${extName}`;
    cb(null, newFileName);
  },
});

const multerMemory = memoryStorage();

const multerOptions = (storageEngine: StorageEngine): Options => ({
  storage: storageEngine,
  limits: {
    fileSize: 1048576 * 10, // 10mb
  },
  fileFilter: (req, file, cb) => {
    const allowedExtRe = /\.(jpg|png|jpeg|webp)$/i;
    const extName = path.extname(file.originalname);
    if (!allowedExtRe.test(extName)) {
      return cb(new Error("Incorrect File"));
    }
    cb(null, true);
  },
});

const uploader = multer(multerOptions(multerDisk));
const cloudUploader = multer(multerOptions(multerMemory));

export const singleUploader = (fieldName: string) => (req: Request<CloudParams>, res: Response<IAuthResponse>, next: NextFunction) => {
  const uploaders = uploader.single(fieldName);
  uploaders(req, res, function (err) {
    if (err instanceof Error) {
      return res.status(400).json({
        msg: "Bad Request",
        err: err.message,
      });
    }
    next();
  });
};
export const singleCloudUploader = (fieldName: string) => (req: Request<CloudParams>, res: Response<IAuthResponse>, next: NextFunction) => {
  const uploaders = cloudUploader.single(fieldName);
  uploaders(req, res, function (err) {
    if (err instanceof Error) {
      console.log(err);
      return res.status(400).json({
        msg: "Bad Request",
        err: err.message,
      });
    }
    next();
  });
};
export const multiUploader = (fieldName: string, maxCount: number) => uploader.array(fieldName, maxCount);
export const multiFieldUploader = (fieldConfig: Field[]) => uploader.fields(fieldConfig);
