import express from "express";
import {changeApiKey} from '../controllers/changeApiKey.controller'
import {testKey} from '../controllers/changeApiKey.controller'
import {AddToolToDb} from '../controllers/AddToolToDB.controller'
import {GetAiTools} from '../controllers/GetAiTools.controller'
import {AiHumanizer} from '../controllers/AiHumanizer.controller'
import {AiEssayExtender} from '../controllers/AiEssayExtender.controller'
import {AiResearchPaperMaker} from '../controllers/AiResearchPaperMaker.controller'
import {AiEssayMaker} from '../controllers/AiEssayMaker.controller'
import {AiDiscussionResponseGenerator} from '../controllers/AiDiscussionResponseGenerator.controller'
import {AiEssayOutlineGenerator} from '../controllers/AiEssayOutlineGenerator.controller'
import {GetBannerUrl} from '../controllers/GetBannerUrl.controller'
import {SetBannerUrl} from '../controllers/SetBannerUrl.controller'

const router = express.Router();

router.route("/getBannerUrl").get(GetBannerUrl);
router.route("/setBannerUrl").post(SetBannerUrl);
router.route("/changeKey").post(changeApiKey);
router.route("/testKey").post(testKey);
router.route("/GetAiTools").get(GetAiTools);
router.route("/AddToolToDb").post(AddToolToDb);
router.route("/humanizer").post(AiHumanizer);
router.route("/essayExtender").post(AiEssayExtender);
router.route("/researchPaperMaker").post(AiResearchPaperMaker);
router.route("/essayMaker").post(AiEssayMaker);
router.route("/discussionResponseGenerator").post(AiDiscussionResponseGenerator);
router.route("/essayOutlineGenerator").post(AiEssayOutlineGenerator);

export default router;
