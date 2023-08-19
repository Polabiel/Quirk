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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const general_1 = require("../../configuration/general");
const InvalidParameterError_1 = require("../../errors/InvalidParameterError");
const simsimi_1 = __importDefault(require("../../services/simsimi"));
const command = {
    name: "Simsimi",
    description: "Comando para conversar com o bot",
    commands: ["simsimi", "bot", `${general_1.general.BOT_NAME}`],
    usage: `${general_1.general.PREFIX}bot eae ${general_1.general.BOT_NAME} tudo bem?`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (!data.args[0]) {
            throw new InvalidParameterError_1.InvalidParameterError("Você precisa enviar uma mensagem!");
        }
        const responseText = yield (0, simsimi_1.default)(data.fullMessage);
        yield data.sendSuccessReply(responseText);
    }),
};
exports.default = command;
