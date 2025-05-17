import { Boom } from "@hapi/boom";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidGroup,
  isJidStatusBroadcast,
  useMultiFileAuthState,
} from "baileys";
import pino from "pino";
import { general } from "./configuration/general";
import qrcode from "qrcode-terminal";
import { logger } from "./utils/logger";

export const connect: () => Promise<WASocket> = async () => {

  console.log('🟢 Iniciando conexão com Whatsapp\n');

  const { state, saveCreds } = await useMultiFileAuthState(
    './assets/auth/baileys',
  );

  const bot = makeWASocket({
    browser: Browsers.appropriate("Desktop"),
    logger: pino({
      level: 'silent',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    }),
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 60 * 1000,
    auth: state,
    shouldIgnoreJid: (jid) => {
      logger.debug(`Ignoring JID: ${jid}`);
      if (process.env.NODE_ENV?.toLocaleLowerCase() === 'development') {
        if (isJidGroup(jid)) {
          return !general.GROUP_SECURE.includes(jid);
        }
        return !general.NUMBERS_HOSTS.includes(jid);
      }
      return isJidBroadcast(jid) || isJidStatusBroadcast(jid);
    },
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
  });

  bot.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr} = update;

    switch (connection) {
      case "close":
        logger.error("🔒 Conexão fechada");
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        if (shouldReconnect) {
          connect();
        }
        break;
      case "open":
        logger.info("🔥 Bot Conectado");
        break;
      case "connecting":
        logger.debug('🫸 Conectando o bot, aguarde...')
    }

    if (qr !== undefined) {
      qrcode.generate(qr, { small: true });
    }
  });


  bot.ev.on("creds.update", saveCreds);

  return bot;
};
