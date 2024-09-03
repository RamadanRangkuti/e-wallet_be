import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { addUser, deleteUser, getDetailUser, getAllUsers, getTotalUser, updateUser, updatePass } from "../repositories/user.repo";
import { IParams, IBody } from "../models/user.model";
import getUserLink from "../helpers/getUserLink";
import { IUserResponse } from "../models/response.model";
import { IUserQuery } from "../models/user.model";
import { UploadApiResponse } from "cloudinary";
import { cloudinaryUploader } from "../helpers/cloudinary";

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
    const result = await getAllUsers(req.query);
    if (result.rowCount === 0) {
      return res.status(404).json({
        msg: "User tidak ditemukan",
        data: [],
      });
    }

    const dataUser = await getTotalUser(req.query);
    console.log(dataUser.rows);
    const page = parseInt((req.query.page as string) || "1");
    const totalData = parseInt(dataUser.rows[0].total_user);
    const totalPage = Math.ceil(totalData / 8);

    console.log(req.query);

    return res.status(200).json({
      msg: "Success",
      data: result.rows,
      meta: {
        totalData,
        totalPage,
        page,
        prevLink: page > 1 ? getUserLink(req, "previous") : null,
        nextLink: page != totalPage ? getUserLink(req, "next") : null,
      },
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
  if (req.file?.filename) {
    req.body.image = req.file.filename;
  }
  try {
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
  const { id } = req.params;
  const { file } = req;

  try {
    let uploadResult: UploadApiResponse | undefined;
    if (file) {
      const { result, error } = await cloudinaryUploader(req, "user", id);
      uploadResult = result;
      if (error) throw error;
      // console.log("Upload Result:", uploadResult);
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
  const { id } = req.params;
  const { password, newpassword } = req.body;
  console.log(password);

  try {
    // Ambil data user berdasarkan ID
    const userResult = await getDetailUser(id);
    if (userResult.rowCount == 0) {
      return res.status(404).json({
        msg: "error",
        err: "User not found",
      });
    }

    const existingHash = userResult.rows[0].password;
    console.log(existingHash);

    // Bandingkan password saat ini
    const isValid = await bcrypt.compare(<string>password, <string>existingHash);
    if (!isValid) {
      return res.status(400).json({
        msg: "error",
        err: "Password saat ini tidak sesuai",
      });
    }

    // Hash password baru
    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(<string>newpassword, salt);

    // Update password di database
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

export const updatePin = async (req: Request<IParams, {}, IBody>, res: Response) => {
  const { id } = req.params;
  const { pin } = req.body;

  try {
    const salt = await bcrypt.genSalt();
    const hashedPin = await bcrypt.hash(<string>pin, salt);
    const result = await updatePass(id, hashedPin);

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

export const remove = async (req: Request<IParams>, res: Response) => {
  const { id } = req.params;
  try {
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
