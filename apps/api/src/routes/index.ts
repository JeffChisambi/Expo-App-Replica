import { Router, type IRouter } from "express";
import coursesRouter from "./courses";
import healthRouter from "./health";
import questionsRouter from "./questions";
import learningRouter from "./learning";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coursesRouter);
router.use(questionsRouter);
router.use(learningRouter);

export default router;
