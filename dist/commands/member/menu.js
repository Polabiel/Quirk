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
const messages_1 = require("../../utils/messages");
const command = {
    name: "menu",
    description: "Menu do bot",
    commands: ["menu", "cmd", "comandos", "commands", "ajuda", "help"],
    usage: `${general_1.general.PREFIX}menu`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        for (const host of general_1.general.GROUP_SECURE) {
            if ((_a = data.remoteJid) === null || _a === void 0 ? void 0 : _a.includes(host)) {
                return yield data.sendSuccessReply(yield (0, messages_1.menuMessage)(true));
            }
        }
        return yield data.sendSuccessReply(yield (0, messages_1.menuMessage)(false));
    }),
};
exports.default = command;
