import { Boom } from "@hapi/boom";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  WASocket,
  isJidBroadcast,
  isJidGroup,
  isJidNewsletter,
  isJidStatusBroadcast,
  useMultiFileAuthState,
} from "baileys";
import { general } from "./configuration/general";
import qrcode from "qrcode-terminal";
import { logger } from "./utils/logger";
import fs from "fs";
import { shouldIgnoreSpamHard } from "./middlewares/onAntiSpam";

export const connect: () => Promise<WASocket> = async () => {
  try {
    console.log('🟢 Iniciando conexão com Whatsapp\n');

    const { state, saveCreds } = await useMultiFileAuthState(
      './assets/auth/baileys',
    );

  const bot = makeWASocket({
    browser: Browsers.appropriate("Desktop"),
    logger: logger,
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 30 * 1000,
    auth: state,    shouldIgnoreJid: (jid) => {
      logger.debug(`Checking JID: ${jid}`);
      
      if (shouldIgnoreSpamHard(jid)) {
        logger.debug(`Anti-spam: Ignoring JID ${jid} due to spam detection (warning already sent)`);
        return true;
      }
      
      if (process.env.NODE_ENV?.toLocaleLowerCase() === 'development') {
        if (isJidGroup(jid)) {
          return !general.GROUP_SECURE.includes(jid);
        }
        return !general.NUMBERS_HOSTS.includes(jid) || jid !== general.NUMBER_BOT;
      }
      
      return isJidBroadcast(jid) || isJidStatusBroadcast(jid) || jid === general.NUMBER_BOT || isJidNewsletter(jid)
    },
    keepAliveIntervalMs: 30 * 1000,
    markOnlineOnConnect: true,
  });

  bot.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;    switch (connection) {
      case "close": {
        const statusCode = (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output?.statusCode
          : undefined;

        if (statusCode === DisconnectReason.loggedOut) {
          logger.error("🔴 Bot desconectado! Por conta disso, vamos remover a pasta de autenticação e você terá que conectar novamente o bot");

          try {
            await fs.promises.rm('./assets/auth/baileys', { recursive: true, force: true });
            logger.info("\n\n🗑️✨ Pasta de autenticação removida com sucesso! Faça login novamente para continuar. 🔑📲\n\n");
          } catch (err) {
            logger.error("❌🚫 Erro ao remover a pasta de autenticação:", err);
          }
        } else {
          switch (statusCode) {
            case DisconnectReason.badSession:
              logger.warn("❌ Sessão inválida!");
              break;
            case DisconnectReason.connectionClosed:
              logger.warn("🔒 Conexão fechada!");
              break;
            case DisconnectReason.connectionLost:
              logger.warn("📡 Conexão perdida!");
              break;
            case DisconnectReason.connectionReplaced:
              logger.warn("♻️ Conexão substituída!");
              break;
            case DisconnectReason.multideviceMismatch:
              logger.warn("📱 Dispositivo incompatível!");
              break;
            case DisconnectReason.forbidden:
              logger.warn("🚫 Conexão proibida!");
              break;
            case DisconnectReason.restartRequired:
              logger.info('\n\n\n🔄 Me reinicie por favor! Digite "npm start" ou caso esteja em modo de desenvolvimento, Digite "npm run dev".\n\n\n');
              break;
            case DisconnectReason.unavailableService:
              logger.warn("⛔ Serviço indisponível!");
              break;
          }

          logger.debug("🔒 Conexão fechada");
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !==
            DisconnectReason.loggedOut;

          if (shouldReconnect) {
            logger.info("🔄 Tentando reconectar...");
            setTimeout(() => {
              connect().catch((error) => {
                logger.error("❌ Erro na reconexão:", error);
                process.exit(1); 
              });
            }, 5000);          }
          break;
        }
        break;
      }
      case "open":
        logger.debug("🔥 Bot Conectado");
        break;
      case "connecting":
        logger.debug("🔄 Conectando...");
        break;
    }

    if (qr !== undefined) {
      logger.debug("🔑 QR Code gerado");
      qrcode.generate(qr, { small: true });
    }
  });


  bot.ev.on("creds.update", saveCreds);

  return bot;
  } catch (error) {
    logger.error("❌ Erro na conexão com WhatsApp:", error);
    throw error;
  }
};
