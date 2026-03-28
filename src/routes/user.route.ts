import { Router } from "express";
import { BulkCreate, BulkUpdate } from "../controller/user.controller";

const router = Router();

router.post("/bulk-create", BulkCreate);

router.put("/bulk-update", BulkUpdate);

export default router;
