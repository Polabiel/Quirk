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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyIfIsGroupSecure = exports.verifyIfIsOwner = exports.verifyIfIsAdmin = exports.isAdminGroup = exports.readCommandImports = exports.choiceRandomCommand = exports.findCommandImport = exports.getRandomName = exports.isCommand = exports.extractCommandAndArgs = exports.downloadContent = exports.downloadImage = exports.downloadVideo = exports.getContent = exports.baileysIs = exports.removeAccentsAndSpecialCharacters = exports.onlyLettersAndNumbers = exports.formatCommand = exports.splitByCharacters = exports.extractDataFromMessage = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const general_1 = require("../configuration/general");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function extractDataFromMessage(baileysMessage) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    const textMessage = (_a = baileysMessage.message) === null || _a === void 0 ? void 0 : _a.conversation;
    const extendedTextMessage = (_c = (_b = baileysMessage.message) === null || _b === void 0 ? void 0 : _b.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text;
    const imageTextMessage = (_e = (_d = baileysMessage.message) === null || _d === void 0 ? void 0 : _d.imageMessage) === null || _e === void 0 ? void 0 : _e.caption;
    const videoTextMessage = (_g = (_f = baileysMessage.message) === null || _f === void 0 ? void 0 : _f.videoMessage) === null || _g === void 0 ? void 0 : _g.caption;
    const fullMessage = textMessage || extendedTextMessage || imageTextMessage || videoTextMessage;
    if (!fullMessage) {
        return {
            remoteJid: (_h = baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.key) === null || _h === void 0 ? void 0 : _h.remoteJid,
            prefix: "",
            isGroup: (_k = (_j = baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.key) === null || _j === void 0 ? void 0 : _j.remoteJid) === null || _k === void 0 ? void 0 : _k.endsWith("@g.us"),
            nickName: baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.pushName,
            fromMe: (_l = baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.key) === null || _l === void 0 ? void 0 : _l.fromMe,
            commandName: "",
            idMessage: (_m = baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.key) === null || _m === void 0 ? void 0 : _m.id,
            participant: (_o = baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.key) === null || _o === void 0 ? void 0 : _o.participant,
            args: [],
            argsJoined: "",
        };
    }
    const [command, ...args] = fullMessage.split(" ");
    const prefix = command.charAt(0);
    const arg = args.reduce((acc, arg) => acc + " " + arg, "").trim();
    const commandWithoutPrefix = command.replace(new RegExp(`^[${general_1.general.PREFIX}]+`), "");
    return {
        fullMessage,
        remoteJid: (_p = baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.key) === null || _p === void 0 ? void 0 : _p.remoteJid,
        prefix,
        isGroup: (_r = (_q = baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.key) === null || _q === void 0 ? void 0 : _q.remoteJid) === null || _r === void 0 ? void 0 : _r.endsWith("@g.us"),
        nickName: baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.pushName,
        fromMe: (_s = baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.key) === null || _s === void 0 ? void 0 : _s.fromMe,
        commandName: (0, exports.formatCommand)(commandWithoutPrefix),
        idMessage: (_t = baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.key) === null || _t === void 0 ? void 0 : _t.id,
        participant: (_u = baileysMessage === null || baileysMessage === void 0 ? void 0 : baileysMessage.key) === null || _u === void 0 ? void 0 : _u.participant,
        args: (0, exports.splitByCharacters)(args.join(" "), ["\\", "|", "/"]),
        argsJoined: arg,
    };
}
exports.extractDataFromMessage = extractDataFromMessage;
const splitByCharacters = (str, characters) => {
    characters = characters.map((char) => char === "\\" ? "\\\\" : char);
    const regex = new RegExp(`[${characters.join("")}]`);
    return str
        .split(regex)
        .map((str) => str.trim())
        .filter(Boolean);
};
exports.splitByCharacters = splitByCharacters;
const formatCommand = (text) => {
    return (0, exports.onlyLettersAndNumbers)((0, exports.removeAccentsAndSpecialCharacters)(text.toLocaleLowerCase().trim()));
};
exports.formatCommand = formatCommand;
const onlyLettersAndNumbers = (text) => {
    return text.replace(/[^a-zA-Z0-9]/g, "");
};
exports.onlyLettersAndNumbers = onlyLettersAndNumbers;
const removeAccentsAndSpecialCharacters = (text) => {
    if (!text)
        return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
exports.removeAccentsAndSpecialCharacters = removeAccentsAndSpecialCharacters;
const baileysIs = (baileysMessage, context) => {
    var _a, _b, _c, _d, _e;
    return (!!((_a = baileysMessage.message) === null || _a === void 0 ? void 0 : _a[`${context}Message`]) ||
        !!((_e = (_d = (_c = (_b = baileysMessage.message) === null || _b === void 0 ? void 0 : _b.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.contextInfo) === null || _d === void 0 ? void 0 : _d.quotedMessage) === null || _e === void 0 ? void 0 : _e[`${context}Message`]));
};
exports.baileysIs = baileysIs;
const getContent = (baileysMessage, type) => {
    var _a, _b, _c, _d, _e, _f;
    return ((_b = (_a = baileysMessage.message) === null || _a === void 0 ? void 0 : _a[`${type}Message`]) !== null && _b !== void 0 ? _b : (_f = (_e = (_d = (_c = baileysMessage.message) === null || _c === void 0 ? void 0 : _c.extendedTextMessage) === null || _d === void 0 ? void 0 : _d.contextInfo) === null || _e === void 0 ? void 0 : _e.quotedMessage) === null || _f === void 0 ? void 0 : _f[`${type}Message`]);
};
exports.getContent = getContent;
const downloadVideo = (baileysMessage) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, exports.downloadContent)(baileysMessage, "input", "video", "mp4");
});
exports.downloadVideo = downloadVideo;
const downloadImage = (baileysMessage) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, exports.downloadContent)(baileysMessage, "input", "image", "png");
});
exports.downloadImage = downloadImage;
const downloadContent = (baileysMessage, fileName, context, extension) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const content = (0, exports.getContent)(baileysMessage, context);
    if (!content) {
        return null;
    }
    const stream = yield (0, baileys_1.downloadContentFromMessage)(content, context);
    let buffer = Buffer.from([]);
    try {
        for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
            _c = stream_1_1.value;
            _d = false;
            const chunk = _c;
            buffer = Buffer.concat([buffer, chunk]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    const filePath = path_1.default.resolve(general_1.general.TEMP_DIR, `${fileName}.${extension}`);
    fs_1.default.writeFileSync(filePath, buffer, { encoding: "binary" });
    return filePath;
});
exports.downloadContent = downloadContent;
const extractCommandAndArgs = (message) => {
    if (!message)
        return { command: "", args: "" };
    const [command, ...tempArgs] = message.trim().split(" ");
    const args = tempArgs.reduce((acc, arg) => acc + " " + arg, "").trim();
    return { command, args };
};
exports.extractCommandAndArgs = extractCommandAndArgs;
const isCommand = (message) => {
    if (typeof message !== "string")
        return false;
    return message.length > 1 && message.startsWith(general_1.general.PREFIX);
};
exports.isCommand = isCommand;
const getRandomName = (extension) => {
    const fileName = Math.floor(Math.random() * 10000);
    if (!extension)
        return fileName.toString();
    return `${fileName}.${extension}`;
};
exports.getRandomName = getRandomName;
const findCommandImport = (commandName) => __awaiter(void 0, void 0, void 0, function* () {
    const command = yield (0, exports.readCommandImports)();
    let typeReturn = "";
    let targetCommandReturn = null;
    for (const [type, commands] of Object.entries(command)) {
        if (!commands.length || type == "auto") {
            continue;
        }
        const targetCommand = commands.find((cmd) => {
            var _a;
            return (_a = cmd === null || cmd === void 0 ? void 0 : cmd.default) === null || _a === void 0 ? void 0 : _a.commands.map((cmd) => (0, exports.formatCommand)(cmd)).includes(commandName);
        });
        if (targetCommand) {
            typeReturn = type;
            targetCommandReturn = targetCommand;
            break;
        }
    }
    return {
        type: typeReturn,
        command: targetCommandReturn,
    };
});
exports.findCommandImport = findCommandImport;
const choiceRandomCommand = () => __awaiter(void 0, void 0, void 0, function* () {
    const command = yield (0, exports.readCommandImports)();
    let typeReturn = "auto";
    const autoCommands = command[typeReturn];
    if (autoCommands && autoCommands.length > 0) {
        const randomIndex = Math.floor(Math.random() * autoCommands.length);
        const randomAutoCommand = autoCommands[randomIndex].default;
        return {
            type: typeReturn,
            command: randomAutoCommand,
        };
    }
    else {
        return {
            type: typeReturn,
            command: null,
        };
    }
});
exports.choiceRandomCommand = choiceRandomCommand;
const readCommandImports = () => __awaiter(void 0, void 0, void 0, function* () {
    const subdirectories = fs_1.default
        .readdirSync(general_1.general.COMMANDS_DIR, { withFileTypes: true })
        .filter((directory) => directory.isDirectory())
        .map((directory) => directory.name);
    const commandImports = {};
    for (const subdir of subdirectories) {
        const subdirectoryPath = path_1.default.join(general_1.general.COMMANDS_DIR, subdir);
        const files = fs_1.default
            .readdirSync(subdirectoryPath)
            .filter((file) => !file.startsWith("_") &&
            (file.endsWith(".js") || file.endsWith(".ts")))
            .map((file) => require(path_1.default.join(subdirectoryPath, file)));
        commandImports[subdir] = files;
    }
    return commandImports;
});
exports.readCommandImports = readCommandImports;
const isAdminGroup = (bot, baileysMessage) => __awaiter(void 0, void 0, void 0, function* () {
    if (extractDataFromMessage(baileysMessage).isGroup) {
        const metadata = yield bot.groupMetadata(extractDataFromMessage(baileysMessage).remoteJid);
        const admins = metadata.participants.filter((participant) => (participant === null || participant === void 0 ? void 0 : participant.admin) != null);
        const adminsIds = admins.map((admin) => admin.id);
        const isAdmin = adminsIds.includes(extractDataFromMessage(baileysMessage).participant);
        return isAdmin;
    }
    return false;
});
exports.isAdminGroup = isAdminGroup;
const verifyIfIsAdmin = (type, bot, baileysMessage) => __awaiter(void 0, void 0, void 0, function* () {
    if (type === "admin") {
        const isAdmin = yield (0, exports.isAdminGroup)(bot, baileysMessage);
        return !!isAdmin;
    }
    return true;
});
exports.verifyIfIsAdmin = verifyIfIsAdmin;
const verifyIfIsOwner = (type, baileysMessage) => __awaiter(void 0, void 0, void 0, function* () {
    if (type === "owner") {
        if (extractDataFromMessage(baileysMessage).isGroup) {
            return general_1.general.NUMBERS_HOSTS.includes(extractDataFromMessage(baileysMessage).participant);
        }
        return general_1.general.NUMBERS_HOSTS.includes(extractDataFromMessage(baileysMessage).remoteJid);
    }
    return true;
});
exports.verifyIfIsOwner = verifyIfIsOwner;
const verifyIfIsGroupSecure = (type, baileysMessage) => __awaiter(void 0, void 0, void 0, function* () {
    if (type === "secure" && extractDataFromMessage(baileysMessage).isGroup) {
        return general_1.general.GROUP_SECURE.includes(extractDataFromMessage(baileysMessage).remoteJid);
    }
    return true;
});
exports.verifyIfIsGroupSecure = verifyIfIsGroupSecure;
