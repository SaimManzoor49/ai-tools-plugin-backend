"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = require("dotenv");
const tools_routes_1 = __importDefault(require("./routes/tools.routes"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
/////////////////// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
/////////////////////routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World!" });
});
app.use('/api/v1', tools_routes_1.default);
//////////////////// APP & DB
(() => {
    app.listen(process.env.PORT || 8081, () => {
        console.log("app is listning on : " + (process.env.PORT || 8081));
    });
    app.on("error", () => {
        console.log("Failed to connect app with DB");
    });
})();
