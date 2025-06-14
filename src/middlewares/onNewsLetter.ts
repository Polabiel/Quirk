import { WASocket, isJidNewsletter, proto } from 'baileys';
import { general } from '../configuration/general';
import { extractDataFromMessage, baileysIs, getContent } from '../utils';
import loadCommomFunctions from '../utils/loadCommomFunctions';
import { logger } from '../utils/logger';
import PrismaSingleton from '../utils/PrismaSingleton';
import RateLimiter, { DataValidator, ErrorRecovery } from '../utils/SafetyUtils';

const prisma = PrismaSingleton.getInstance();

export default async (bot: WASocket, baileysMessage: proto.IWebMessageInfo) => {

 if (!baileysMessage?.key?.remoteJid) return;
 if (!isJidNewsletter(baileysMessage.key.remoteJid)) return;

 logger.info('📰 Newsletter detectada! Reenviando para todos os usuários...');

 try {

  const isHealthy = await PrismaSingleton.healthCheck();
  if (!isHealthy) {
   logger.error('❌ Banco de dados não está saudável. Pulando newsletter.');
   return;
  }

  const {
   sendTextWithRemotejid,
   sendImageFromFile,
   sendVideoFromFile,
   sendStickerFromFile,
  } = loadCommomFunctions(bot, baileysMessage);


  const [groups, users] = await Promise.allSettled([
   prisma.group.findMany({
    where: {
     newsletter: true,
     blacklist: false,
    },
    select: { number: true },
   }),
   prisma.user.findMany({
    where: {
     newsletter: true,
     blacklist: false,
    },
    select: { number: true },
   }),
  ]);

  const validGroups = groups.status === 'fulfilled' ? groups.value : [];
  const validUsers = users.status === 'fulfilled' ? users.value : [];

  if (groups.status === 'rejected') {
   logger.error('❌ Erro ao buscar grupos:', groups.reason);
  }
  if (users.status === 'rejected') {
   logger.error('❌ Erro ao buscar usuários:', users.reason);
  }

  const recipients = [
   ...validGroups.map((group) => group.number),
   ...validUsers.map((user) => user.number),
  ];


  const validRecipients = recipients.filter(recipient =>
   DataValidator.isValidJid(recipient)
  );

  if (validRecipients.length === 0) {
   logger.info('📰 Newsletter detectada, mas nenhum destinatário válido configurado para receber.');
   return;
  }

  logger.info(`📰 Newsletter será enviada para ${validGroups.length} grupos e ${validUsers.length} usuários.`);


  const delay = RateLimiter.getDelay(validRecipients.length);

  await processNewsletterContent(baileysMessage, validRecipients, delay, {
   sendTextWithRemotejid,
   sendImageFromFile,
   sendVideoFromFile,
   sendStickerFromFile,
  });

  logger.info('✅ Newsletter reenviada com sucesso para todos os usuários!');
 } catch (error) {
  logger.error('❌ Erro crítico ao reenviar newsletter:', error);


  try {
   const errorMessage = `🚨 *ERRO CRÍTICO NO SISTEMA DE NEWSLETTER*\n\n${error}\n\nVerifique os logs para mais detalhes.`;
   for (const host of general.NUMBERS_HOSTS) {
    await bot.sendMessage(host, { text: errorMessage });
   }
  } catch (notificationError) {
   logger.error('❌ Falha ao notificar proprietários sobre erro:', notificationError);
  }
 }
};


async function processNewsletterContent(
 baileysMessage: proto.IWebMessageInfo,
 recipients: string[],
 delay: number,
 senders: {
  sendTextWithRemotejid: (text: string, remoteJid: string) => Promise<any>;
  sendImageFromFile: (file: string, caption?: string) => Promise<any>;
  sendVideoFromFile: (file: string, caption: string) => Promise<any>;
  sendStickerFromFile: (file: string) => Promise<any>;
 },
) {
 const { fullMessage } = extractDataFromMessage(baileysMessage);

 if (baileysIs(baileysMessage, 'image')) {
  await handleImageContent(
   baileysMessage,
   recipients,
   delay,
   senders.sendTextWithRemotejid,
   fullMessage,
  );
  return;
 }

 if (baileysIs(baileysMessage, 'video')) {
  await handleVideoContent(
   baileysMessage,
   recipients,
   delay,
   senders.sendTextWithRemotejid,
   fullMessage,
  );
  return;
 }

 if (baileysIs(baileysMessage, 'sticker')) {
  await handleStickerContent(recipients, delay, senders.sendTextWithRemotejid);
  return;
 }

 if (baileysIs(baileysMessage, 'document')) {
  await handleDocumentContent(
   baileysMessage,
   recipients,
   delay,
   senders.sendTextWithRemotejid,
   fullMessage,
  );
  return;
 }

 if (baileysIs(baileysMessage, 'audio')) {
  await handleAudioContent(recipients, delay, senders.sendTextWithRemotejid);
  return;
 }

 if (fullMessage) {
  const sanitizedMessage = DataValidator.sanitizeText(fullMessage);
  const formattedMessage = `📰 *NEWSLETTER RECEBIDA* 📰\n\n${sanitizedMessage}\n\n🤖 Reencaminhado via ${general.BOT_NAME}`;
  await sendToAllRecipients(
   recipients,
   delay,
   senders.sendTextWithRemotejid,
   formattedMessage,
  );
  return;
 }

 await sendToAllRecipients(
  recipients,
  delay,
  senders.sendTextWithRemotejid,
  `📰 *NEWSLETTER RECEBIDA* 📰\n\n📱 Conteúdo recebido do newsletter (tipo não suportado para reenvio)\n\n🤖 Reencaminhado via ${general.BOT_NAME}`,
 );
}


async function handleImageContent(
 baileysMessage: proto.IWebMessageInfo,
 recipients: string[],
 delay: number,
 sendFunction: (text: string, remoteJid: string) => Promise<any>,
 fullMessage: string | undefined,
) {
 const imageContent = getContent(baileysMessage, 'image') as any;
 if (imageContent) {
  const caption = imageContent.caption ?? fullMessage ?? '';
  const sanitizedCaption = DataValidator.sanitizeText(caption);
  const captionText = sanitizedCaption ? `\nLegenda: ${sanitizedCaption}` : '';
  const message = `📰 *NEWSLETTER - IMAGEM RECEBIDA* 📰\n\n📷 Uma imagem foi recebida do newsletter${captionText}\n\n🤖 Reencaminhado via ${general.BOT_NAME}`;

  await sendToAllRecipients(recipients, delay, sendFunction, message);
 }
}


async function handleVideoContent(
 baileysMessage: proto.IWebMessageInfo,
 recipients: string[],
 delay: number,
 sendFunction: (text: string, remoteJid: string) => Promise<any>,
 fullMessage: string | undefined,
) {
 const videoContent = getContent(baileysMessage, 'video') as any;
 if (videoContent) {
  const caption = videoContent.caption ?? fullMessage ?? '';
  const sanitizedCaption = DataValidator.sanitizeText(caption);
  const captionText = sanitizedCaption ? `\nLegenda: ${sanitizedCaption}` : '';
  const message = `📰 *NEWSLETTER - VÍDEO RECEBIDO* 📰\n\n🎥 Um vídeo foi recebido do newsletter${captionText}\n\n🤖 Reencaminhado via ${general.BOT_NAME}`;

  await sendToAllRecipients(recipients, delay, sendFunction, message);
 }
}


async function handleStickerContent(
 recipients: string[],
 delay: number,
 sendFunction: (text: string, remoteJid: string) => Promise<any>,
) {
 const message = `📰 *NEWSLETTER - STICKER RECEBIDO* 📰\n\n🎭 Um sticker foi recebido do newsletter\n\n🤖 Reencaminhado via ${general.BOT_NAME}`;
 await sendToAllRecipients(recipients, delay, sendFunction, message);
}


async function handleDocumentContent(
 baileysMessage: proto.IWebMessageInfo,
 recipients: string[],
 delay: number,
 sendFunction: (text: string, remoteJid: string) => Promise<any>,
 fullMessage: string | undefined,
) {
 const documentContent = getContent(baileysMessage, 'document') as any;
 const fileName = DataValidator.sanitizeText(documentContent?.fileName ?? 'documento');
 const caption = documentContent?.caption ?? fullMessage ?? '';
 const sanitizedCaption = DataValidator.sanitizeText(caption);
 const captionText = sanitizedCaption ? `\nDescrição: ${sanitizedCaption}` : '';
 const message = `📰 *NEWSLETTER - DOCUMENTO RECEBIDO* 📰\n\n📎 Documento: ${fileName}${captionText}\n\n🤖 Reencaminhado via ${general.BOT_NAME}`;

 await sendToAllRecipients(recipients, delay, sendFunction, message);
}


async function handleAudioContent(
 recipients: string[],
 delay: number,
 sendFunction: (text: string, remoteJid: string) => Promise<any>,
) {
 const message = `📰 *NEWSLETTER - ÁUDIO RECEBIDO* 📰\n\n🎵 Um áudio foi recebido do newsletter\n\n🤖 Reencaminhado via ${general.BOT_NAME}`;
 await sendToAllRecipients(recipients, delay, sendFunction, message);
}


async function sendToAllRecipients(
 recipients: string[],
 delay: number,
 sendFunction: (message: string, remoteJid: string) => Promise<any>,
 message: string,
) {
 const sanitizedMessage = DataValidator.sanitizeText(message);
 let successCount = 0;
 let failureCount = 0;

 for (const recipient of recipients) {

  if (!DataValidator.isValidJid(recipient)) {
   logger.warn(`⚠️ JID inválido ignorado: ${recipient}`);
   failureCount++;
   continue;
  }


  if (!RateLimiter.canSend(recipient)) {
   logger.warn(`🚫 Rate limit atingido para ${recipient}`);
   failureCount++;
   continue;
  }

  try {
   await ErrorRecovery.retryOperation(
    () => sendFunction(sanitizedMessage, recipient),
    2,
    1000
   );

   successCount++;
   logger.debug(`✅ Enviado para ${recipient}`);
  } catch (error) {
   failureCount++;
   logger.error(`❌ Falha definitiva ao enviar para ${recipient}:`, error);
  }


  await new Promise((resolve) => setTimeout(resolve, delay));
 }

 logger.info(`📊 Resumo do envio: ${successCount} sucessos, ${failureCount} falhas`);


 RateLimiter.cleanup();
}
