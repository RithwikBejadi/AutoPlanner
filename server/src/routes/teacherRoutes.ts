import { Router } from "express";
import { teacherController } from "../controllers/teacherController.js";
import { authenticate } from "../middleware/auth.js";

export const teacherRouter = Router();

teacherRouter.use(authenticate);

teacherRouter.get("/", (req, res) => teacherController.getAll(req, res));
teacherRouter.get("/:id", (req, res) => teacherController.getById(req, res));
teacherRouter.post("/", (req, res) => teacherController.create(req, res));
teacherRouter.put("/:id", (req, res) => teacherController.update(req, res));
teacherRouter.delete("/:id", (req, res) => teacherController.delete(req, res));
