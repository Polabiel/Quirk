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
Object.defineProperty(exports, "__esModule", { value: true });
const general_1 = require("../../configuration/general");
const InvalidParameterError_1 = require("../../errors/InvalidParameterError");
const gpt_1 = require("../../services/gpt");
const command = {
    name: "GPT-3",
    description: "Comando para perguntar algo para o GPT-3",
    commands: ["gpt", general_1.general.BOT_NAME],
    usage: `${general_1.general.PREFIX}gpt ${general_1.general.BOT_NAME} o que é a vida?`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.isGroup) {
            yield data.sendWaitReact();
            if (!data.args[0]) {
                throw new InvalidParameterError_1.InvalidParameterError("Você precisa me perguntar algo!");
            }
            const responseText = yield (0, gpt_1.gpt2)(data.args[0]);
            yield data.sendSuccessReply(responseText);
        }
        yield data.sendWarningReply("Este comando só pode ser executado em grupos!");
    }),
};
exports.default = command;
