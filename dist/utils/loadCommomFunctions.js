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
const _1 = require(".");
const general_1 = require("../configuration/general");
const messages_1 = require("./messages");
function default_1(bot, baileysMessage) {
    const { remoteJid, prefix, commandName, args, idMessage, participant, fromMe, isGroup, nickName, argsJoined, fullMessage } = (0, _1.extractDataFromMessage)(baileysMessage);
    const isImage = (0, _1.baileysIs)(baileysMessage, "image");
    const isVideo = (0, _1.baileysIs)(baileysMessage, "video");
    const isSticker = (0, _1.baileysIs)(baileysMessage, "sticker");
    const sendText = (text, emoji) => __awaiter(this, void 0, void 0, function* () {
        if (emoji) {
            return yield bot.sendMessage(remoteJid, {
                text: `${general_1.general.PREFIX_EMOJI} ${text}`,
            });
        }
        return yield bot.sendMessage(remoteJid, { text: `${text}` });
    });
    const sendTextOwner = (text, emoji) => __awaiter(this, void 0, void 0, function* () {
        for (const host of general_1.general.NUMBERS_HOSTS) {
            if (emoji) {
                return yield bot.sendMessage(host, { text: `${general_1.general.PREFIX_EMOJI} ${text}` }, { quoted: baileysMessage });
            }
            return yield bot.sendMessage(host, { text: `${text}` });
        }
    });
    const sendReply = (text, emoji) => __awaiter(this, void 0, void 0, function* () {
        if (emoji) {
            return yield bot.sendMessage(remoteJid, { text: `${general_1.general.PREFIX_EMOJI} ${text}` }, { quoted: baileysMessage });
        }
        return yield bot.sendMessage(remoteJid, { text: `${text}` }, { quoted: baileysMessage });
    });
    const sendReplyWithMentions = (text, mentions, emoji) => __awaiter(this, void 0, void 0, function* () {
        if (emoji) {
            return yield bot.sendMessage(remoteJid, {
                text: `${general_1.general.PREFIX_EMOJI}
              ${text}`,
                mentions,
            }, { quoted: baileysMessage });
        }
        return yield bot.sendMessage(remoteJid, {
            text: `${text}`,
            mentions,
        }, { quoted: baileysMessage });
    });
    const sendReplyOwner = (text, emoji) => __awaiter(this, void 0, void 0, function* () {
        for (let host of general_1.general.NUMBERS_HOSTS) {
            if (emoji) {
                return yield bot.sendMessage(host, { text: `${general_1.general.PREFIX_EMOJI} ${text}` }, { quoted: baileysMessage });
            }
            return yield bot.sendMessage(host, { text: `${text}` }, { quoted: baileysMessage });
        }
    });
    const sendReact = (emoji) => __awaiter(this, void 0, void 0, function* () {
        return yield bot.sendMessage(remoteJid, {
            react: {
                text: emoji,
                key: baileysMessage.key,
            },
        });
    });
    const sendSuccessReact = () => __awaiter(this, void 0, void 0, function* () { return yield sendReact("✅"); });
    const sendWaitReact = () => __awaiter(this, void 0, void 0, function* () { return yield sendReact("⏳"); });
    const sendWarningReact = () => __awaiter(this, void 0, void 0, function* () { return yield sendReact("⚠️"); });
    const sendErrorReact = () => __awaiter(this, void 0, void 0, function* () { return yield sendReact("❌"); });
    const sendSuccessReply = (text, emoji) => __awaiter(this, void 0, void 0, function* () {
        if (emoji) {
            yield sendSuccessReact();
            return yield sendReply(`${text}`);
        }
        yield sendSuccessReact();
        return yield sendReply(`${text}`);
    });
    const sendMentionReply = (text, mentions, emoji) => __awaiter(this, void 0, void 0, function* () {
        yield sendSuccessReact();
        if (emoji) {
            return yield sendReplyWithMentions(`${general_1.general.PREFIX_EMOJI} ${text}`, mentions);
        }
        return yield sendReplyWithMentions(`${text}`, mentions);
    });
    const sendWaitReply = (text) => __awaiter(this, void 0, void 0, function* () {
        yield sendWaitReact();
        return yield sendReply(`⏳ Aguarde! ${text || messages_1.waitMessage}`);
    });
    const sendWarningReply = (text) => __awaiter(this, void 0, void 0, function* () {
        yield sendWarningReact();
        return yield sendReply(`⚠️ Atenção! ${text}`);
    });
    const sendErrorReply = (text) => __awaiter(this, void 0, void 0, function* () {
        yield sendErrorReact();
        return yield sendReply(`❌ Erro! ${text}`);
    });
    const sendLogOwner = (text) => __awaiter(this, void 0, void 0, function* () {
        return yield sendReplyOwner(`${general_1.general.PREFIX_EMOJI}💻 Notificação! ${text}`);
    });
    const sendStickerFromFile = (file) => __awaiter(this, void 0, void 0, function* () {
        return yield bot.sendMessage(remoteJid, {
            sticker: { url: file },
        });
    });
    const sendImageFromFile = (file) => __awaiter(this, void 0, void 0, function* () {
        return yield bot.sendMessage(remoteJid, {
            image: { url: file },
        });
    });
    const sendVideoFromFile = (file, caption) => __awaiter(this, void 0, void 0, function* () {
        return yield bot.sendMessage(remoteJid, {
            video: { url: file },
            caption: caption,
        });
    });
    return {
        bot,
        fullMessage,
        remoteJid,
        prefix,
        commandName,
        args,
        isImage,
        isVideo,
        isSticker,
        idMessage,
        participant,
        fromMe,
        isGroup,
        nickName,
        argsJoined,
        baileysMessage,
        sendReplyWithMentions,
        sendMentionReply,
        sendText,
        sendLogOwner,
        sendTextOwner,
        sendReplyOwner,
        sendReply,
        sendStickerFromFile,
        sendImageFromFile,
        sendVideoFromFile,
        sendReact,
        sendSuccessReact,
        sendWaitReact,
        sendWarningReact,
        sendErrorReply,
        sendSuccessReply,
        sendWaitReply,
        sendWarningReply,
        sendErrorReact,
    };
}
exports.default = default_1;
