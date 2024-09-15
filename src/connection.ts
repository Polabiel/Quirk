import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  WASocket,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import pino from "pino";

export const connect: () => Promise<WASocket> = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(
    "./assets/auth/baileys"
  );

  const bot = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: "info" }) as any
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
