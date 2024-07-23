import { Router } from "express";

import { singleUploader } from "../middlewares/upload";

import { getUser, getDetail, add, update, remove } from "../handlers/user.handler"
import { authorization } from "../middlewares/authorization";

const router = Router();


router.get('/', getUser);
router.get('/:id', authorization, getDetail);
router.post('/', singleUploader("images"), add);
router.patch('/:id', singleUploader("images"), update);
router.delete('/:id', remove);


export default router;