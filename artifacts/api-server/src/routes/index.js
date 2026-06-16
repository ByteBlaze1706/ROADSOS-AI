import { Router } from "express";
import healthRouter from "./health.js";
import profileRouter from "./profile.js";
import sosRouter from "./sos.js";
import incidentsRouter from "./incidents.js";
import chatRouter from "./chat.js";

const router = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(sosRouter);
router.use(incidentsRouter);
router.use(chatRouter);

export default router;
