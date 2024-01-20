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
const WarningError_1 = require("../../errors/WarningError");
const gpt_1 = __importDefault(require("../../services/gpt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const command = {
    name: "GPT-3",
    description: "Comando para perguntar algo para o GPT-3",
    commands: ["gpt", general_1.general.BOT_NAME, "chat", "chat-gpt"],
    usage: `${general_1.general.PREFIX}gpt ${general_1.general.BOT_NAME} o que é a vida?`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield data.sendWaitReact();
        if (data.isGroup) {
            const group = yield prisma.group.findUnique({
                where: {
                    number: data.remoteJid,
                },
            });
            if (!(group === null || group === void 0 ? void 0 : group.TOKEN_OPEANAI))
                throw new WarningError_1.WarningError("Você precisa de um token para usar o GPT\n\nPara obter um token, acesse: https://platform.openai.com/account/api-keys e envie o comando /token <token>");
            if (!data.args[0]) {
                throw new InvalidParameterError_1.InvalidParameterError("Você precisa me perguntar algo!");
            }
            const responseText = yield (0, gpt_1.default)(data.args[0], group.TOKEN_OPEANAI);
            yield data.sendSuccessReply(responseText);
        }
        return yield data.sendWarningReply("Este comando só pode ser executado em grupos!");
    }),
};
exports.default = command;
