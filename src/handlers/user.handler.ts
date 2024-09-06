import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { addUser, deleteUser, getDetailUser, getAllUsers, getTotalUser, updateUser, updatePass, updatePin, deleteImage } from "../repositories/user.repo";
import { IParams, IBody } from "../models/user.model";
// import getUserLink from "../helpers/getUserLink";
import { IUserResponse } from "../models/response.model";
import { IUserQuery } from "../models/user.model";
import { UploadApiResponse } from "cloudinary";
import { cloudinaryUploader } from "../helpers/cloudinary";
import getLink from "../helpers/getLink";

// export const get = async (req: Request, res: Response) => {
//   try {
//     const result = await getUser();
//     return res.status(200).json(result.rows);
//   } catch (err) {
//     if (err instanceof Error) {
//       console.log(err.message);
//     }
//     return res.status(500).json({
//       msg: "Error",
//       err: "Internal Server Error",
//     });
//   }
// };
export const getUser = async (req: Request<{}, {}, {}, IUserQuery>, res: Response<IUserResponse>) => {
  try {
    const limit = 8;
    const page = parseInt((req.query.page as string) || "1", 10);

    const result = await getAllUsers(req.query);
    if (result.rowCount === 0) {
      return res.status(404).json({
        msg: "User tidak ditemukan",
        data: [],
      });
    }

    const dataUser = await getTotalUser(req.query);
    const totalData = parseInt(dataUser.rows[0].total_user, 10);
    const totalPage = Math.ceil(totalData / limit);
    
    return res.status(200).json({
      msg: "Success",
      data: result.rows,
      meta: {
        totalData,
        totalPage,
        page,
        prevLink: page > 1 ? getLink(req, "previous") : null,
        nextLink: page < totalPage ? getLink(req, "next") : null,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
      return res.status(500).json({
        msg: "Error",
        err: err.message, // Properly access the error message
      });
    } else {
      console.log('An unknown error occurred');
      return res.status(500).json({
        msg: "Error",
        err: "An unknown error occurred",
      });
    }
  }
};

export const getDetail = async (req: Request<IParams>, res: Response) => {
  try {
    const { id } = req.params;
    const result = await getDetailUser(id);
    if (result.rows.length === 0) {
      return res.status(404).json({
        msg: "User not found",
        data: [],
      });
    }
    return res.status(200).json({
      msg: "Success",
      data: result.rows,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

export const add = async (req: Request<{}, {}, IBody>, res: Response) => {
  try {
    if (req.file?.filename) {
      req.body.image = req.file.filename;
    }
    const result = await addUser(req.body);
    return res.status(201).json({
      msg: "Success",
      data: result.rows,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

export const update = async (req: Request<{ id: string }, {}, IBody>, res: Response) => {
  try {
    const { id } = req.params;
    const { file } = req;
    let uploadResult: UploadApiResponse | undefined;
    if (file) {
      const { result, error } = await cloudinaryUploader(req, "user", id);
      uploadResult = result;
      if (error) throw error;
    }
    const dbResult = await updateUser(req.body, id, uploadResult?.secure_url);
    if (dbResult.rowCount === 0) {
      return res.status(404).json({
        msg: "User not found",
        data: [],
      });
    }
    return res.status(200).json({
      msg: "success",
      data: dbResult.rows,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (/(invalid(.)+id(.)+)/g.test(err.message)) {
        return res.status(401).json({
          msg: "Error",
          err: "User tidak ditemukan",
        });
      }
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

export const updatePassword = async (req: Request<IParams, {}, IBody>, res: Response) => {
  try {
    const { id } = req.params;
    const { password, newpassword } = req.body;
    console.log(password);
    const userResult = await getDetailUser(id);
    if (userResult.rowCount == 0) {
      return res.status(404).json({
        msg: "error",
        err: "User not found",
      });
    }

    const existingHash = userResult.rows[0].password;
    console.log(existingHash);

    const isValid = await bcrypt.compare(<string>password, <string>existingHash);
    if (!isValid) {
      return res.status(400).json({
        msg: "error",
        err: "Password saat ini tidak sesuai",
      });
    }

    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(<string>newpassword, salt);

    const result = await updatePass(id, hashedNewPassword);

    return res.status(200).json({
      msg: "success",
      data: result.rows,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

export const updatedPin = async (req: Request<IParams, {}, IBody>, res: Response) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPin = await bcrypt.hash(<string>pin, salt);
    const result = await updatePin(id, hashedPin);

    return res.status(200).json({
      msg: "success",
      data: result.rows,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      console.log(err.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

export const removeImage = async (req: Request<IParams>, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteImage(id);
    if (result.rows.length === 0) {
      return res.status(404).json({
        msg: "User tidak ditemukan",
        data: [],
      });
    }
    return res.status(200).json({
      msg: "Success Deleted Image",
      data: result.rows,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};

export const remove = async (req: Request<IParams>, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteUser(id);
    if (result.rows.length === 0) {
      return res.status(404).json({
        msg: "User tidak ditemukan",
        data: [],
      });
    }
    return res.status(200).json({
      msg: "Success Deleted User",
      data: result.rows,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    return res.status(500).json({
      msg: "Error",
      err: "Internal Server Error",
    });
  }
};
