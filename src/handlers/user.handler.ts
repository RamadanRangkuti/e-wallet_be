import { Request, Response } from "express";
import { addUser, deleteUser, getDetailUser, getAllUsers, getTotalUser, updateUser } from "../repositories/user.repo";
import { IParams, IBody } from "../models/user.model";
import  getUserLink from "../helpers/getUserLink";
import { IUserResponse } from "../models/response";
import { IUserQuery } from "../models/user.model";

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

    const dataUser = await getTotalUser();
    const page = parseInt((req.query.page as string) || "1");
    const totalData = parseInt(dataUser.rows[0].total_user);
    const totalPage = Math.ceil(totalData / 5);

    return res.status(200).json({
      msg: "Success",
      data: result.rows,
      meta: {
        totalData,
        totalPage,
        page,
        prevLink: page > 1 ? getUserLink(req, "previous") : null,
        nextLink: page < totalPage ? getUserLink(req, "next") : null,
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
        data: []
      });
    }
    return res.status(200).json({
      msg: "Success",
      data: result.rows
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
      data: result.rows
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

export const update = async (req: Request<IParams, {}, IBody>, res: Response) => {
  const { id } = req.params;
  if (req.file?.filename) {
    req.body.image = req.file.filename;
  }
  try {
    const result = await updateUser(id, req.body);
    if (result.rowCount === 0) {
      return res.status(404).json({
        msg: "error",
        err: "User not found",
      });
    }
    return res.status(200).json({
      msg: "success",
      data: result.rows,
    });
  } catch (err: unknown) {
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
        data: []
      });
    }
    return res.status(200).json({
      msg: "Success Deleted User",
      data: result.rows
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


