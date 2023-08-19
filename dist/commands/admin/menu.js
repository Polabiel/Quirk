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
    name: "Menu de admintradores",
    description: "Menu de comandos de admin",
    commands: [
        "menustaff",
        "staff",
        "staffmenu",
        "adminmenu",
        "menuadmin",
        "admin",
    ],
    usage: `${general_1.general.PREFIX}menuadmin`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield data.sendReply(yield (0, messages_1.menuAdminMessage)());
    }),
};
exports.default = command;
