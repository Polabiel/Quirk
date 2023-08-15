import { proto } from "@whiskeysockets/baileys";
import { general } from "./configuration/general";

const { onMessagesUpsert } = require("./middlewares/onMesssagesUpsert");

export const load = (bot) => {
  bot.ev.on("messages.upsert", async (messages: proto.IWebMessageInfo) => {
    setTimeout(() => {
      onMessagesUpsert({ bot, messages });
    }, general.TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  });
};