import express from "express";
import {AiExtendEssay} from '../controllers/AiExtendEssay.controller'
import {AiHumanizer} from '../controllers/AiHumanizer.controller'

const router = express.Router();

router.route("/essay-extender").post(AiExtendEssay);
router.route("/humanizer").post(AiHumanizer);

export default router;
