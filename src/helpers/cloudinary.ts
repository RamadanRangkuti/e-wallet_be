import { Request } from "express-serve-static-core";
import DataUriParser from "datauri/parser";
import path from "path";

import Cloudinary from "../configs/cloud";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";

export const cloudinaryUploader = async (req: Request, prefix: string, uid: string | null): Promise<{ result?: UploadApiResponse; error?: Error }> => {
  const { file } = req;
  if (!file) return { error: new Error("File tidak ditemukan") };
  const { buffer } = file;

  const parser = new DataUriParser();
  const extName = path.extname(file.originalname);
  const base64File = parser.format(extName, buffer);
  if (!base64File.content) return { error: new Error("Failed Parsing") };

  const publicId = `${prefix}-${file.fieldname}-${uid}`;

  try {
    const uploadConfig: UploadApiOptions = {
      folder: "coffeeshop",
      public_id: publicId,
    };
    const result = await Cloudinary.uploader.upload(base64File.content, uploadConfig);
    return { result };
  } catch (error) {
    if (!(error instanceof Error)) {
      console.log(error);
    }
    return { error: error as Error };
  }
};
