import express from "express";
import {AiHumanizer} from '../controllers/AiHumanizer.controller'
import {AiEssayExtender} from '../controllers/AiEssayExtender.controller'
import {changeApiKey} from '../controllers/changeApiKey.controller'
import {testKey} from '../controllers/changeApiKey.controller'
import {AddToolToDb} from '../controllers/AddToolToDB.controller'
import {GetAiTools} from '../controllers/GetAiTools.controller'

const router = express.Router();

router.route("/changeKey").post(changeApiKey);
router.route("/testKey").post(testKey);
router.route("/humanizer").post(AiHumanizer);
router.route("/essayExtender").post(AiEssayExtender);
router.route("/AddToolToDb").post(AddToolToDb);
router.route("/GetAiTools").get(GetAiTools);

export default router;
