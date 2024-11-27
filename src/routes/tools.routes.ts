import express from "express";
import {AiExtendEssay} from '../controllers/AiExtendEssay.controller'
import {AiHumanizer} from '../controllers/AiHumanizer.controller'
import {changeApiKey} from '../controllers/changeApiKey.controller'

const router = express.Router();

router.route("/changeKey").post(changeApiKey);
router.route("/essay-extender").post(AiExtendEssay);
router.route("/humanizer").post(AiHumanizer);

export default router;
