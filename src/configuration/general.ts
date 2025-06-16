import path from "path";
import fs from "fs";
require("dotenv").config();

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

const getProjectRoot = (): string => {
  let currentDir = __dirname;

  while (!fs.existsSync(path.join(currentDir, "package.json"))) {
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return currentDir;
};

const ensureDirectoryExists = (dirPath: string): string => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

const projectRoot = getProjectRoot();
const isProduction = process.env.NODE_ENV === "production";

export const general: GeneralConfig = {
  BOT_NAME: "Quirk",
  PREFIX: "/",
  PREFIX_EMOJI: "🤖",
  COMMANDS_DIR: path.join(__dirname, "..", "commands"),
  TEMP_DIR: ensureDirectoryExists(path.join(projectRoot, "assets", "temp")),
  CACHE_DIR: ensureDirectoryExists(path.join(projectRoot, "cache")),  TIMEOUT_IN_MILLISECONDS_BY_EVENT: 15000,
  NUMBERS_HOSTS: [process.env.NUMBER_HOST ?? ""],
  NUMBER_BOT: process.env.NUMBER_BOT ? `${process.env.NUMBER_BOT}@s.whatsapp.net` : "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GROUP_SECURE: [
    "120363360525817583@g.us",
    "5519987529732-1625550643@g.us",
    "120363126503356308@g.us",
    "5519987207781-1552075231@g.us",
    "120363166422910155@g.us",
  ],
};
