import path from "path";

interface GeneralConfig {
  BOT_NAME: string;
  PREFIX: string;
  PREFIX_EMOJI: string;
  COMMANDS_DIR: string;
  TEMP_DIR: string;
  CACHE_DIR: string;
  TIMEOUT_IN_MILLISECONDS_BY_EVENT: number;
  NUMBERS_HOSTS: string[];
  NUMBER_BOT: string;
  OPENAI_API_KEY: string | undefined;
  GROUP_SECURE: string[];
}

export const general: GeneralConfig = {
  BOT_NAME: "zanoni",
  PREFIX: "/",
  PREFIX_EMOJI: "🤖",
  COMMANDS_DIR: path.join(__dirname, "..", "commands"),
  TEMP_DIR: path.resolve(__dirname, "..", "..", "assets", "temp"),
  CACHE_DIR: path.resolve(__dirname, "..", "..", "cache"),
  TIMEOUT_IN_MILLISECONDS_BY_EVENT: 15000,
  NUMBERS_HOSTS: ["5519981022857@s.whatsapp.net"],
  NUMBER_BOT: "556186063515@s.whatsapp.net",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GROUP_SECURE: [
    "5519987529732-1625550643@g.us",
    "120363126503356308@g.us",
    "5519987207781-1552075231@g.us",
  ],
};
