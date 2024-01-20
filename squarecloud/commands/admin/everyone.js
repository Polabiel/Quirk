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
const WarningError_1 = require("../../errors/WarningError");
const command = {
    name: "Everyone",
    description: "Marca todo mundo do grupo",
    commands: ["everyone", "tagall", "marcar", "all", "tag"],
    usage: `${general_1.general.PREFIX}everyone`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield data.sendWaitReact();
        try {
            const groupMetadata = yield data.bot.groupMetadata(data.remoteJid);
            const mentions = groupMetadata.participants.map((participant) => {
                return {
                    tag: "@",
                    userId: participant.id.split("@")[0],
                };
            });
            if (!data.args[0]) {
                const message = {
                    text: "Marcando todos os cornos(as)",
                    mentions: mentions.map((m) => `${m.userId}@s.whatsapp.net`),
                };
                return yield data.sendMentionReply(message.text, message.mentions);
            }
            const message = {
                text: data.args.join(" "),
                mentions: mentions.map((m) => `${m.userId}@s.whatsapp.net`),
            };
            return yield data.sendMentionReply(message.text, message.mentions);
        }
        catch (error) {
            if (error.message === "not-authorized")
                throw new Forbidden_1.Forbidden("Você não tem permissão para banir este usuário!");
            throw new WarningError_1.WarningError("Não foi possível marcar todos os usuários!");
        }
    }),
};
exports.default = command;
