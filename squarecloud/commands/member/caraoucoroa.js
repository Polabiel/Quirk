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
    name: "caraoucoroa",
    description: "Jogar cara ou coroa",
    commands: ["cara", "caraoucoroa", "coroa", "coinflip", "flip"],
    usage: `${general_1.general.PREFIX}caraoucoroa`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const numeroRandom = Math.floor(Math.random() * 2);
        let resultado;
        if (numeroRandom === 0) {
            resultado = "Cara";
            yield data.sendReact("🌕");
        }
        else {
            resultado = "Coroa";
            yield data.sendReact("🌑");
        }
        return yield data.sendReply(`Resultado: ${resultado}`);
    }),
};
exports.default = command;
