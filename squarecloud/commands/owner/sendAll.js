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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const command = {
    name: "Comunicado",
    description: "Esse comando envia uma mensagem para todos os grupos e contatos",
    commands: [
        "comunicado",
        "comunicar",
        "avisar",
        "anunciar",
        "anuncio",
        "anúncio",
        "anúnciar",
    ],
    usage: `${general_1.general.PREFIX}comunicado <mensagem>`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield data.sendWaitReact();
        if (!data.args[0])
            throw new InvalidParameterError_1.InvalidParameterError("Você precisa enviar uma mensagem");
        const Message = `Mesagem do proprietário do bot: ${data.args.join(" ")}`;
        const groups = yield prisma.group.findMany();
        const users = yield prisma.user.findMany();
        for (const group of groups) {
            yield data.sendTextWithRemotejid(Message, group.number);
        }
        for (const user of users) {
            yield data.sendTextWithRemotejid(Message, user.number);
        }
        return data.sendSuccessReply("Mensagem enviada com sucesso!");
    }),
};
exports.default = command;
