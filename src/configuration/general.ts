import path from "path";
require("dotenv").config();

export const general = {
  BOT_NAME: "Quirk",
  PREFIX: "/",
  PREFIX_EMOJI: "🤖",
  COMMANDS_DIR: path.join(__dirname, "..", "commands"),
  TEMP_DIR: path.resolve(__dirname, "..", "..", "assets", "temp"),
  CACHE_DIR: path.resolve(__dirname, "..", "..", "cache"),
  TIMEOUT_IN_MILLISECONDS_BY_EVENT: 15000,
  NUMBERS_HOSTS: (process.env.NUMBERS_HOSTS ? process.env.NUMBERS_HOSTS.split(",").map(host => `${host}@s.whatsapp.net`) : []),
  NUMBER_BOT: `${process.env.NUMBER_BOT ?? null}@s.whatsapp.net`,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? null,
  GROUP_SECURE: [
    "120363360525817583@g.us",
    "5519987529732-1625550643@g.us",
    "120363126503356308@g.us",
    "5519987207781-1552075231@g.us",
    "120363166422910155@g.us",
  ],
};
