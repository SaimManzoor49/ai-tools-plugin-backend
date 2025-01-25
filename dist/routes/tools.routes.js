"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const changeApiKey_controller_1 = require("../controllers/changeApiKey.controller");
const changeApiKey_controller_2 = require("../controllers/changeApiKey.controller");
const AddToolToDB_controller_1 = require("../controllers/AddToolToDB.controller");
const GetAiTools_controller_1 = require("../controllers/GetAiTools.controller");
const AiHumanizer_controller_1 = require("../controllers/AiHumanizer.controller");
const AiEssayExtender_controller_1 = require("../controllers/AiEssayExtender.controller");
const AiResearchPaperMaker_controller_1 = require("../controllers/AiResearchPaperMaker.controller");
const AiEssayMaker_controller_1 = require("../controllers/AiEssayMaker.controller");
const AiDiscussionResponseGenerator_controller_1 = require("../controllers/AiDiscussionResponseGenerator.controller");
const AiEssayOutlineGenerator_controller_1 = require("../controllers/AiEssayOutlineGenerator.controller");
const GetBannerUrl_controller_1 = require("../controllers/GetBannerUrl.controller");
const SetBannerUrl_controller_1 = require("../controllers/SetBannerUrl.controller");
const AiHookGenerator_controller_1 = require("../controllers/AiHookGenerator.controller");
const AiEssayIntroductionGenerator_controller_1 = require("../controllers/AiEssayIntroductionGenerator.controller");
const AiDebateCraft_controller_1 = require("../controllers/AiDebateCraft.controller");
const AiResearchPaperOutlineGenerator_controller_1 = require("../controllers/AiResearchPaperOutlineGenerator.controller");
const AiRhetoricalAnalysisGenerator_controller_1 = require("../controllers/AiRhetoricalAnalysisGenerator.controller");
const AiHomeWorkHelper_controller_1 = require("../controllers/AiHomeWorkHelper.controller");
const AiTopicsGenerator_controller_1 = require("../controllers/AiTopicsGenerator.controller");
const router = express_1.default.Router();
router.route("/getBannerUrl").get(GetBannerUrl_controller_1.GetBannerUrl);
router.route("/setBannerUrl").post(SetBannerUrl_controller_1.SetBannerUrl);
router.route("/changeKey").post(changeApiKey_controller_1.changeApiKey);
router.route("/testKey").post(changeApiKey_controller_2.testKey);
router.route("/GetAiTools").get(GetAiTools_controller_1.GetAiTools);
router.route("/AddToolToDb").post(AddToolToDB_controller_1.AddToolToDb);
router.route("/updateToolModel").post(AddToolToDB_controller_1.updateToolModel);
router.route("/humanizer").post(AiHumanizer_controller_1.AiHumanizer);
router.route("/essayExtender").post(AiEssayExtender_controller_1.AiEssayExtender);
router.route("/researchPaperMaker").post(AiResearchPaperMaker_controller_1.AiResearchPaperMaker);
router.route("/essayMaker").post(AiEssayMaker_controller_1.AiEssayMaker);
router.route("/discussionResponseGenerator").post(AiDiscussionResponseGenerator_controller_1.AiDiscussionResponseGenerator);
router.route("/essayOutlineGenerator").post(AiEssayOutlineGenerator_controller_1.AiEssayOutlineGenerator);
router.route("/hookGenerator").post(AiHookGenerator_controller_1.AiHookGenerator);
router.route("/essayIntroductionGenerator").post(AiEssayIntroductionGenerator_controller_1.AiEssayIntroductionGenerator);
router.route("/debateCraft").post(AiDebateCraft_controller_1.AiDebateCraft);
router.route("/researchPaperOutlineGenerator").post(AiResearchPaperOutlineGenerator_controller_1.AiResearchPaperOutlineGenerator);
router.route("/rhetoricalAnalysisGenerator").post(AiRhetoricalAnalysisGenerator_controller_1.AiRhetoricalAnalysisGenerator);
router.route("/homeWorkHelper").post(AiHomeWorkHelper_controller_1.AiHomeWorkHelper);
router.route("/topicsGenerator").post(AiTopicsGenerator_controller_1.AiTopicsGenerator);
exports.default = router;
