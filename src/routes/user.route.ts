import { Router } from "express";

import { singleCloudUploader, singleUploader } from "../middlewares/upload";

import { getUser, getDetail, add, update, remove, updatePassword, updatedPin } from "../handlers/user.handler";
import { authorization } from "../middlewares/authorization";

const router = Router();

router.get("/", getUser);
router.get("/:id", authorization, getDetail);
router.post("/", singleUploader("image"), add);
router.put("/:id", singleCloudUploader("image"), update);
router.delete("/:id", remove);
router.put("/editpassword/:id", updatePassword);
router.put("/editpin/:id", updatedPin);

export default router;
