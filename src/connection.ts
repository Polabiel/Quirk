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
// @ts-ignore
import qrcode from "qrcode-terminal";
import { logger } from "./utils/logger";

export const connect: () => Promise<WASocket> = async () => {

  console.log('🟢 Iniciando conexão com Whatsapp\n');

  const { state, saveCreds } = await useMultiFileAuthState(
    './assets/auth/baileys',
  );

  const { version } = await fetchLatestBaileysVersion();

  // @ts-ignore
  const bot = makeWASocket({
    browser: Browsers.appropriate("Desktop"),
    version,
    logger: pino({
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    }) as any,
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 60 * 1000,
    auth: state,
    shouldIgnoreJid: (jid) => {
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
        // Remover o bot/deletar dados se necessário
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
        logger.info('🫸 Conectando o bot, aguarde...')
    }

    if (qr !== undefined) {
      qrcode.generate(qr, { small: true });
    }
  });


  bot.ev.on("creds.update", saveCreds);

  return bot;
};
