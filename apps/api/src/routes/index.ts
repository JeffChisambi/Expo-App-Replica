import { Router, type IRouter } from "express";
import coursesRouter from "./courses";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coursesRouter);

export default router;
