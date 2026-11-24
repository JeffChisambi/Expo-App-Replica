import { Router, type IRouter } from "express";
import coursesRouter from "./courses";
import healthRouter from "./health";
import questionsRouter from "./questions";
import learningRouter from "./learning";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coursesRouter);
router.use(questionsRouter);
router.use(learningRouter);
router.use(authRouter);

export default router;
