"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AiExtendEssay_controller_1 = require("../controllers/AiExtendEssay.controller");
const AiHumanizer_controller_1 = require("../controllers/AiHumanizer.controller");
const router = express_1.default.Router();
router.route("/essay-extender").post(AiExtendEssay_controller_1.AiExtendEssay);
router.route("/humanizer").post(AiHumanizer_controller_1.AiHumanizer);
exports.default = router;
