import path from "path";
// require("dotenv").config();

interface GeneralConfig {
  BOT_NAME: string;
  PREFIX: string;
  PREFIX_EMOJI: string;
  COMMANDS_DIR: string;
  TEMP_DIR: string;
  TIMEOUT_IN_MILLISECONDS_BY_EVENT: number;
  NUMBERS_HOSTS: string[];
  NUMBER_BOT: string;
  OPENAI_API_KEY: string | undefined;
  GROUP_SECURE: string[];
}

export const general: GeneralConfig = {
  BOT_NAME: "Zanoni BOT",
  PREFIX: "/",
  PREFIX_EMOJI: "🤖",
  COMMANDS_DIR: path.join(__dirname, "..", "commands"),
  TEMP_DIR: path.resolve(__dirname, "..", "assets", "temp"),
  TIMEOUT_IN_MILLISECONDS_BY_EVENT: 700,
  NUMBERS_HOSTS: ["5519981022857@s.whatsapp.net"],
  NUMBER_BOT: "5516988265334@s.whatsapp.net",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GROUP_SECURE: ['any']
};
