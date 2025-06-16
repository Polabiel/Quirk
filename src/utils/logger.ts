import { debug } from "node:console";
import pino from "pino";

const logger = pino({
  level: "debug",
  transport: {
    target: 'pino-pretty',
    options: {
      levelFirst: true,
      translateTime: true,
      colorize: true,
    }
  }
});

export { logger };