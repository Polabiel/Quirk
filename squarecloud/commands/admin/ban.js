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
const Forbidden_1 = require("../../errors/Forbidden");
const InvalidParameterError_1 = require("../../errors/InvalidParameterError");
const WarningError_1 = require("../../errors/WarningError");
const command = {
    name: "Banimento",
    description: "Bani um usuário ou mais usuários do grupo",
    commands: ["ban", "banir", "banimento", "kick", "kickar", "expulsar"],
    usage: `${general_1.general.PREFIX}ban @numero1 | @numero2`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (!data.args[0]) {
            throw new InvalidParameterError_1.InvalidParameterError("Você precisa mencionar um usuário!");
        }
        const userList = data.args.map((number) => {
            if (number.startsWith("@")) {
                number = number.slice(1);
            }
            return {
                id: `${number}@s.whatsapp.net`,
            };
        });
        try {
            for (const element of userList) {
                if (element.id.startsWith(general_1.general.NUMBER_BOT)) {
                    throw new InvalidParameterError_1.InvalidParameterError("Não posso me banir!");
                }
                yield data.bot.groupParticipantsUpdate(data.remoteJid, [element.id], "remove");
            }
        }
        catch (error) {
            if (error.message === "not-authorized")
                throw new Forbidden_1.Forbidden("Você não tem permissão para banir este usuário!");
            throw new WarningError_1.WarningError("Não foi possível banir o(s) usuário(s)!");
        }
        return data.sendSuccessReply("Usuário(s) banido(s) com sucesso!");
    }),
};
exports.default = command;
