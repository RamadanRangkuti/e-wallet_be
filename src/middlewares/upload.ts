import { RequestHandler } from "express";
import multer, { Field, memoryStorage, Options, StorageEngine } from "multer";
import path from "path";
import { AppParams } from "../models/params";

const multerDisk = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, `${new Date().getTime()}-${file.originalname}`);
  },
});

const multerMemory = memoryStorage();

const multerOptions = (storageEngine: StorageEngine): Options => ({
  storage: storageEngine,
  limits: {
    fileSize: 1048576 * 10, // 10mb
  },
  fileFilter: (req, file, cb) => {
    const allowedExtRe = /jpg|png|jpeg/gi;
    const extName = path.extname(file.originalname);
    if (!allowedExtRe.test(extName)) return cb(new Error("Incorrect File"));
    cb(null, true);
  },
});

const uploader = multer(multerOptions(multerDisk));
const cloudUploader = multer(multerOptions(multerMemory));

export const singleUploader = (fieldName: string) => uploader.single(fieldName) as RequestHandler<AppParams>;
export const singleCloudUploader = (fieldName: string) => cloudUploader.single(fieldName) as RequestHandler<AppParams>;
export const multiUploader = (fieldName: string, maxCount: number) => uploader.array(fieldName, maxCount);
export const multiFieldUploader = (fieldConfig: Field[]) => uploader.fields(fieldConfig);
