import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidStatusBroadcast,
  proto,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import pino from "pino";
import NodeCache from "node-cache";
import { general } from "./configuration/general";

const msgRetryCounterCache = new NodeCache();

export const connect: () => Promise<WASocket> = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(
    "./assets/auth/baileys"
  );

  const { version } = await fetchLatestBaileysVersion();

  const bot = makeWASocket({
    version,
    logger: pino({
      serializers: {
        ...pino.stdSerializers,
        error: (err) => {
          if (err instanceof Error) {
            return {
              message: err.message,
              name: err.name,
              stack: err.stack,
            };
          }
          return err;
        },
        message: (msg) => {
          if (msg instanceof proto.WebMessageInfo) {
            return {
              key: msg.key,
              message: msg.message,
              messageTimestamp: new Date(
                typeof msg.messageTimestamp === "number"
                  ? msg.messageTimestamp
                  : msg.messageTimestamp.toNumber()
              ),
            };
          }
          return { message: msg };
        },
      },
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    }) as any,
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 60 * 1000,
    auth: state,
    shouldIgnoreJid: (jid) => {
      if (process.env.NODE_ENV?.toLocaleLowerCase() === "development") {
        return !general.NUMBERS_HOSTS.includes(jid);
      }
      return isJidBroadcast(jid) || isJidStatusBroadcast(jid);
    },
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
  });

  bot.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom).output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        connect();
      }
    }
  });

  bot.ev.on("creds.update", saveCreds);

  return bot;
};
