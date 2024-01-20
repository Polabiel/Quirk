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
const command = {
    name: "monkey",
    description: "Enviar um emoji de macaco aleatório",
    commands: [],
    usage: ``,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (Math.random() < 0.03 && !data.fromMe) {
            const userNumbers = [
                "5519983578858@s.whatsapp.net",
                "5519998971730@s.whatsapp.net",
                "5519991312964@s.whatsapp.net",
                "5519998291139@s.whatsapp.net",
            ];
            if (!userNumbers) {
                throw new Error("Não foi possível encontrar os números dos usuários");
            }
            const monkeyEmoji = ["🐵", "🦍", "🦧"];
            const choiceRandom = monkeyEmoji[Math.floor(Math.random() * monkeyEmoji.length)];
            if (data.isGroup &&
                general_1.general.GROUP_SECURE.includes(data.remoteJid) &&
                userNumbers.includes(data.participant)) {
                try {
                    if (userNumbers.includes(data.participant)) {
                        yield data.sendReact(choiceRandom);
                        return;
                    }
                }
                catch (error) {
                    console.error(`Erro: ${error}`);
                }
            }
        }
    }),
};
exports.default = command;
