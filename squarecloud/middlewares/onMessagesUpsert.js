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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../connection");
const InstanceCommand_1 = __importDefault(require("../utils/InstanceCommand"));
const autoCommand_1 = __importDefault(require("../utils/autoCommand"));
const database_1 = __importDefault(require("../database"));
exports.default = () => __awaiter(void 0, void 0, void 0, function* () {
    const bot = yield (0, connection_1.connect)();
    bot.ev.on("messages.upsert", (message) => __awaiter(void 0, void 0, void 0, function* () {
        const baileysMessage = message.messages[0];
        yield bot.readMessages([baileysMessage.key]);
        if (baileysMessage.key.fromMe)
            return;
        yield (0, database_1.default)(bot, baileysMessage);
        yield (0, InstanceCommand_1.default)(bot, baileysMessage);
        yield (0, autoCommand_1.default)(bot, baileysMessage);
    }));
});
