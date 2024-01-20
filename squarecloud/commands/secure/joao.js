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
    name: "João",
    description: "João envia uma imagem ou video aleatório do joão",
    commands: ["joao", "joão", "jao", "jão"],
    usage: `${general_1.general.PREFIX}joao`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (Math.random() < 0.5) {
            yield data.sendImageFromFile("https://telegra.ph/file/ab47cfb86938bcb9dcd8b.jpg");
            return;
        }
        yield data.sendImageFromFile("https://telegra.ph/file/9e78cfbac221acd3e889c.png");
    }),
};
exports.default = command;
