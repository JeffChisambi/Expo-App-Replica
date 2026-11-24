import { Router, type IRouter } from "express";
import coursesRouter from "./courses";
import healthRouter from "./health";
import studentsRouter from "./students";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coursesRouter);
router.use(studentsRouter);

export default router;
