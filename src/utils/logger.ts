import pino from "pino";

const isProduction = process.env.NODE_ENV === 'production';
const isRunningInPM2 = !!process.env.PM2_HOME;

const createLogger = (): pino.Logger => {
  if (isProduction || isRunningInPM2) {
    return pino({
      level: process.env.PINO_LOG_LEVEL ?? 'info',
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  } else {
    return pino({
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          levelFirst: true,
          translateTime: 'SYS:dd/mm/yyyy HH:MM:ss',
          colorize: true,
          ignore: 'pid,hostname',
          messageFormat: '[{time}] {msg}',
        }
      }
    });
  }
};

const logger = createLogger();

export { logger };