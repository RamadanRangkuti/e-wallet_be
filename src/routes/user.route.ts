import { Router } from "express";

import { singleCloudUploader, singleUploader } from "../middlewares/upload";

import { getUser, getDetail, add, update, remove, updatePassword, updatedPin, removeImage } from "../handlers/user.handler";
import { authorization } from "../middlewares/authorization";

const router = Router();

router.get("/", getUser);
router.get("/:id", authorization, getDetail);
router.post("/", singleUploader("image"), add);
router.put("/:id", authorization, singleCloudUploader("image"), update);
router.delete("/image/:id", authorization, removeImage);
router.delete("/:id", remove);
router.put("/editpassword/:id", authorization, updatePassword);
router.put("/editpin/:id", authorization, updatedPin);

export default router;
