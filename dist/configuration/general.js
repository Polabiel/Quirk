"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.general = void 0;
const path_1 = __importDefault(require("path"));
exports.general = {
    BOT_NAME: "zanoni",
    PREFIX: "/",
    PREFIX_EMOJI: "🤖",
    COMMANDS_DIR: path_1.default.join(__dirname, "..", "commands"),
    TEMP_DIR: path_1.default.resolve(__dirname, "..", "assets", "temp"),
    TIMEOUT_IN_MILLISECONDS_BY_EVENT: 700,
    NUMBERS_HOSTS: ["5519981022857@s.whatsapp.net"],
    NUMBER_BOT: "5516988265334@s.whatsapp.net",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GROUP_SECURE: [
        "5519987529732-1625550643@g.us",
        "120363126503356308@g.us",
        "5519987207781-1552075231@g.us",
    ],
};
