import { Router } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import sosRouter from "./sos";
import incidentsRouter from "./incidents";
import chatRouter from "./chat";

const router = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(sosRouter);
router.use(incidentsRouter);
router.use(chatRouter);

export default router;
