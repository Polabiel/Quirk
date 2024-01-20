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
const command = {
    name: "Forever",
    description: "Esse comando que envia uma imagem aleatoria toda vez que o forever fala alguma coisa",
    commands: [],
    usage: ``,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const numberForever = "554188853723";
        if (!((_a = data.remoteJid) === null || _a === void 0 ? void 0 : _a.startsWith(numberForever)) ||
            !((_b = data.participant) === null || _b === void 0 ? void 0 : _b.startsWith(numberForever)))
            return;
        if (Math.random() <= 0.5) {
            yield data.sendReact("🏳‍🌈");
        }
        else {
            yield data.sendReact("🏳️‍⚧️");
        }
    }),
};
exports.default = command;
