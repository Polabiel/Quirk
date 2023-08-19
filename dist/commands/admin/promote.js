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
const command = {
    name: "Promote",
    description: "promover um usuário ou mais usuários do grupo",
    commands: ["promote", "promover"],
    usage: `${general_1.general.PREFIX}promover @numero1 | @numero2`,
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
                yield data.bot.groupParticipantsUpdate(data.remoteJid, [element.id], "promote");
            }
        }
        catch (error) {
            return yield data.sendWarningReply(`Não foi possível promover o(s) usuário(s)!\n Você deve usar o comando assim *${general_1.general.PREFIX}promover @numero1 | @numero2*`);
        }
        return data.sendSuccessReply("Usuário(s) promovido(s) com sucesso!");
    }),
};
exports.default = command;
