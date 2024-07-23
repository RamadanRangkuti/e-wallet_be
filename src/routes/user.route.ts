import { Router } from "express";

import { singleCloudUploader, singleUploader } from "../middlewares/upload";

import { getUser, getDetail, add, update, remove, updatePassword, updatePin } from "../handlers/user.handler";
import { authorization } from "../middlewares/authorization";

const router = Router();

router.get("/", getUser);
router.get("/:id", authorization, getDetail);
router.post("/", singleUploader("image"), add);
router.patch("/:id", singleCloudUploader("image"), update);
router.delete("/:id", remove);
router.patch("/editpassword/:id", updatePassword);
router.patch("/editpin/:id", updatePin);

export default router;
