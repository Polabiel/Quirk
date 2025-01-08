import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidGroup,
  isJidStatusBroadcast,
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
      level: "error",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    }) as any,
    printQRInTerminal: true,
    defaultQueryTimeoutMs: 60 * 1000,
    auth: state,
    shouldIgnoreJid: (jid) => {
      if (process.env.NODE_ENV?.toLocaleLowerCase() === "development") {
        if (isJidGroup(jid)) {
          return !general.GROUP_SECURE.includes(jid);
        }
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
