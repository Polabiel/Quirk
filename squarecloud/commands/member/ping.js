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
    name: "Ping",
    description: "Comando para verificar o tempo de resposta do bot",
    commands: ["ping", "pong", "latency", "latencia", "latência", "pingar"],
    usage: `${general_1.general.PREFIX}ping`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const start = Date.now();
        yield data.sendReact("🏓");
        const end = Date.now();
        const latency = end - start;
        if (latency > 0) {
            return yield data.sendReply(`🏓 Pong!\nTempo de resposta: ${latency}ms`);
        }
        else {
            return yield data.sendReply(`🏓 Pong!\nTempo de resposta indisponível.`);
        }
    }),
};
exports.default = command;
