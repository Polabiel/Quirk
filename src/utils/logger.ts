import pino from "pino";

const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
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