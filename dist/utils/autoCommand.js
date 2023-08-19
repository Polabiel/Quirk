"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const loadCommomFunctions_1 = __importDefault(require("./loadCommomFunctions"));
const simsimi_1 = __importDefault(require("../services/simsimi"));
const general_1 = require("../configuration/general");
function default_1(bot, baileysMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = __rest((0, loadCommomFunctions_1.default)(bot, baileysMessage), []);
        const { command } = yield (0, _1.choiceRandomCommand)();
        if ((0, _1.isCommand)(data.fullMessage))
            return;
        processMessage(data, baileysMessage);
        if (Math.random() < 0.05)
            return;
        try {
            yield (command === null || command === void 0 ? void 0 : command.handle(Object.assign({}, data)));
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.default = default_1;
function processMessage(data, baileysMessage) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const keywordsRegex = /(bot|zanoni)/i;
        const shouldUseSimsimi = keywordsRegex.test(data.fullMessage);
        const mentionedMessage = ((_c = (_b = (_a = baileysMessage.message) === null || _a === void 0 ? void 0 : _a.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.contextInfo) === null || _c === void 0 ? void 0 : _c.participant) ===
            general_1.general.NUMBER_BOT;
        if ((shouldUseSimsimi || mentionedMessage) &&
            !data.fromMe &&
            Math.random() < 0.35) {
            return data.sendText(yield (0, simsimi_1.default)(data.fullMessage));
        }
    });
}
