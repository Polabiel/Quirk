import { WASocket, isJidNewsletter, proto, DownloadableMessage, MediaType } from 'baileys';
import { general } from '../configuration/general';
import {
  extractDataFromMessage,
  baileysIs,
  getContent,
  downloadImage,
  downloadVideo,
  downloadSticker,
  downloadAudio,
  downloadFile,
} from '../utils';
import { logger } from '../utils/logger';
import PrismaSingleton from '../utils/PrismaSingleton';
import RateLimiter, {
  DataValidator,
  ErrorRecovery,
} from '../utils/SafetyUtils';
import fs from 'fs';
import path from 'path';

const prisma = PrismaSingleton.getInstance();

function getNewsletterContent(
  baileysMessage: proto.IWebMessageInfo,
  type: string,
) {
  const message = baileysMessage.message;

  let content = message?.[`${type}Message` as keyof typeof message];

  content ??=
    message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
      `${type}Message` as keyof typeof message
    ];

  content ??=
    message?.viewOnceMessage?.message?.[
      `${type}Message` as keyof typeof message
    ];

  content ??=
    message?.ephemeralMessage?.message?.[
      `${type}Message` as keyof typeof message
    ];

  return content;
}

async function downloadNewsletterContent(
  baileysMessage: proto.IWebMessageInfo,
  fileName: string,
  context: string,
  extension: string,
) {
  try {
    const standardDownload = await downloadImage(baileysMessage);
    if (standardDownload) return standardDownload;

    const content = getNewsletterContent(baileysMessage, context);
    if (content) {
      logger.debug(
        `📥 Tentando download específico de newsletter para ${context}`,
      );
      const { downloadContentFromMessage } = await import('baileys');      if (typeof content === 'object' && content !== null && 'url' in content) {
        const stream = await downloadContentFromMessage(
          content as DownloadableMessage,
          context as MediaType,
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        const filePath = path.resolve(
          general.TEMP_DIR,
          `${fileName}.${extension}`,
        );
        fs.writeFileSync(filePath, buffer, { encoding: 'binary' });
        return filePath;
      }
    }

    return null;
  } catch (error) {
    logger.error(
      `❌ Erro no download específico de newsletter para ${context}:`,
      error,
    );
    return null;
  }
}

export default async (bot: WASocket, baileysMessage: proto.IWebMessageInfo) => {
  if (!baileysMessage?.key?.remoteJid) return;
  if (!isJidNewsletter(baileysMessage.key.remoteJid)) return;

  logger.info('📰 Newsletter detectada! Reenviando para todos os usuários...');
  logger.debug(
    '📰 Estrutura completa da mensagem de newsletter:',
    JSON.stringify(baileysMessage, null, 2),
  );

  logger.debug('📰 Tipos de mensagem detectados:');
  logger.debug(`- É imagem: ${baileysIs(baileysMessage, 'image')}`);
  logger.debug(`- É vídeo: ${baileysIs(baileysMessage, 'video')}`);
  logger.debug(`- É sticker: ${baileysIs(baileysMessage, 'sticker')}`);
  logger.debug(`- É documento: ${baileysIs(baileysMessage, 'document')}`);
  logger.debug(`- É áudio: ${baileysIs(baileysMessage, 'audio')}`);

  try {
    const isHealthy = await PrismaSingleton.healthCheck();
    if (!isHealthy) {
      logger.error('❌ Banco de dados não está saudável. Pulando newsletter.');
      return;
    }

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

    const validRecipients = recipients.filter((recipient) =>
      DataValidator.isValidJid(recipient),
    );

    if (validRecipients.length === 0) {
      logger.info(
        '📰 Newsletter detectada, mas nenhum destinatário válido configurado para receber.',
      );
      return;
    }

    logger.info(
      `📰 Newsletter será enviada para ${validGroups.length} grupos e ${validUsers.length} usuários.`,
    );

    const delay = RateLimiter.getDelay(validRecipients.length);

    await processNewsletterContent(baileysMessage, validRecipients, delay, bot);

    logger.info('✅ Newsletter reenviada com sucesso para todos os usuários!');
  } catch (error) {
    logger.error('❌ Erro crítico ao reenviar newsletter:', error);

    try {
      const errorMessage = `🚨 *ERRO CRÍTICO NO SISTEMA DE NEWSLETTER*\n\n${error}\n\nVerifique os logs para mais detalhes.`;
      for (const host of general.NUMBERS_HOSTS) {
        await bot.sendMessage(host, { text: errorMessage });
      }
    } catch (notificationError) {
      logger.error(
        '❌ Falha ao notificar proprietários sobre erro:',
        notificationError,
      );
    }
  }
};

async function processNewsletterContent(
  baileysMessage: proto.IWebMessageInfo,
  recipients: string[],
  delay: number,
  bot: WASocket,
) {
  const { fullMessage } = extractDataFromMessage(baileysMessage);

  if (baileysIs(baileysMessage, 'image')) {
    await handleImageContent(
      baileysMessage,
      recipients,
      delay,
      bot,
      fullMessage,
    );
    return;
  }

  if (baileysIs(baileysMessage, 'video')) {
    await handleVideoContent(
      baileysMessage,
      recipients,
      delay,
      bot,
      fullMessage,
    );
    return;
  }

  if (baileysIs(baileysMessage, 'sticker')) {
    await handleStickerContent(baileysMessage, recipients, delay, bot);
    return;
  }

  if (baileysIs(baileysMessage, 'document')) {
    await handleDocumentContent(
      baileysMessage,
      recipients,
      delay,
      bot,
      fullMessage,
    );
    return;
  }

  if (baileysIs(baileysMessage, 'audio')) {
    await handleAudioContent(
      baileysMessage,
      recipients,
      delay,
      bot,
      fullMessage,
    );
    return;
  }

  if (fullMessage) {
    const sanitizedMessage = DataValidator.sanitizeText(fullMessage);
    const formattedMessage = `📰 *NEWSLETTER* 📰\n\n${sanitizedMessage}`;
    await sendTextToAllRecipients(recipients, delay, bot, formattedMessage);
  }
}

async function handleImageContent(
  baileysMessage: proto.IWebMessageInfo,
  recipients: string[],
  delay: number,
  bot: WASocket,
  fullMessage: string | undefined,
) {
  let imagePath: string | null = null;
  try {
    logger.info('📷 Baixando imagem da newsletter...');
    logger.debug(
      '📷 Estrutura da mensagem:',
      JSON.stringify(baileysMessage.message, null, 2),
    );
    imagePath = (await downloadImage(baileysMessage)) ?? null;
    logger.debug(`📷 Caminho da imagem baixada: ${imagePath}`);    if (!imagePath) {
      const imageContent = getContent(baileysMessage, 'image') as proto.Message.IImageMessage | undefined;
      logger.debug(
        '📷 Conteúdo da imagem encontrado:',
        JSON.stringify(imageContent, null, 2),
      );
    }

    if (!imagePath) {
      logger.warn('⚠️ Falha ao baixar imagem da newsletter');
      const imageContent = getContent(baileysMessage, 'image') as proto.Message.IImageMessage | undefined;
      const caption = imageContent?.caption ?? fullMessage ?? '';
      const sanitizedCaption = DataValidator.sanitizeText(caption);
      const fallbackMessage = sanitizedCaption
        ? `📰 *NEWSLETTER* 📰\n\n${sanitizedCaption}`
        : `📰 *NEWSLETTER* 📰`;
      await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
      return;
    }

    if (!fs.existsSync(imagePath)) {
      logger.warn('⚠️ Arquivo de imagem não existe no caminho especificado');
      const imageContent = getContent(baileysMessage, 'image') as proto.Message.IImageMessage | undefined;
      const caption = imageContent?.caption ?? fullMessage ?? '';
      const sanitizedCaption = DataValidator.sanitizeText(caption);
      const fallbackMessage = sanitizedCaption
        ? `📰 *NEWSLETTER* 📰\n\n${sanitizedCaption}`
        : `📰 *NEWSLETTER* 📰`;
      await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
      return;
    }

    const imageContent = getContent(baileysMessage, 'image') as proto.Message.IImageMessage | undefined;
    const caption = imageContent?.caption ?? fullMessage ?? '';
    const sanitizedCaption = DataValidator.sanitizeText(caption);
    const formattedCaption = `📰 *NEWSLETTER - IMAGEM* 📰\n\n${sanitizedCaption}\n\n🤖 Reencaminhado via ${general.BOT_NAME}`;

    logger.info(`📷 Enviando imagem para ${recipients.length} destinatários`);
    await sendImageToAllRecipients(
      recipients,
      delay,
      bot,
      imagePath,
      formattedCaption,
    );
  } catch (error) {
    logger.error('❌ Erro ao processar imagem da newsletter:', error);
    const imageContent = getContent(baileysMessage, 'image') as proto.Message.IImageMessage | undefined;
    const caption = imageContent?.caption ?? fullMessage ?? '';
    const sanitizedCaption = DataValidator.sanitizeText(caption);
    const fallbackMessage = sanitizedCaption
      ? `📰 *NEWSLETTER* 📰\n\n${sanitizedCaption}`
      : `📰 *NEWSLETTER* 📰`;
    await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
  } finally {
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
        logger.debug(`🗑️ Arquivo temporário removido: ${imagePath}`);
      } catch (cleanupError) {
        logger.warn('⚠️ Erro ao limpar arquivo temporário:', cleanupError);
      }
    }
  }
}

async function handleVideoContent(
  baileysMessage: proto.IWebMessageInfo,
  recipients: string[],
  delay: number,
  bot: WASocket,
  fullMessage: string | undefined,
) {
  let videoPath: string | null = null;

  try {
    logger.info('🎥 Baixando vídeo da newsletter...');

    videoPath = (await downloadVideo(baileysMessage)) ?? null;    if (!videoPath) {
      logger.warn('⚠️ Falha ao baixar vídeo da newsletter');
      const videoContent = getContent(baileysMessage, 'video') as proto.Message.IVideoMessage | undefined;
      const caption = videoContent?.caption ?? fullMessage ?? '';
      const sanitizedCaption = DataValidator.sanitizeText(caption);
      const fallbackMessage = sanitizedCaption
        ? `📰 *NEWSLETTER* 📰\n\n${sanitizedCaption}`
        : `📰 *NEWSLETTER* 📰`;
      await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
      return;
    }

    const videoContent = getContent(baileysMessage, 'video') as proto.Message.IVideoMessage | undefined;
    const caption = videoContent?.caption ?? fullMessage ?? '';
    const sanitizedCaption = DataValidator.sanitizeText(caption);
    const formattedCaption = `📰 *NEWSLETTER - VÍDEO* 📰\n\n${sanitizedCaption}\n\n🤖 Reencaminhado via ${general.BOT_NAME}`;

    await sendVideoToAllRecipients(
      recipients,
      delay,
      bot,
      videoPath,
      formattedCaption,
    );
  } catch (error) {
    logger.error('❌ Erro ao processar vídeo da newsletter:', error);
    const videoContent = getContent(baileysMessage, 'video') as proto.Message.IVideoMessage | undefined;
    const caption = videoContent?.caption ?? fullMessage ?? '';
    const sanitizedCaption = DataValidator.sanitizeText(caption);
    const fallbackMessage = sanitizedCaption
      ? `📰 *NEWSLETTER* 📰\n\n${sanitizedCaption}`
      : `📰 *NEWSLETTER* 📰`;
    await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
  } finally {
    if (videoPath && fs.existsSync(videoPath)) {
      try {
        fs.unlinkSync(videoPath);
        logger.debug(`🗑️ Arquivo temporário removido: ${videoPath}`);
      } catch (cleanupError) {
        logger.warn('⚠️ Erro ao limpar arquivo temporário:', cleanupError);
      }
    }
  }
}

async function handleStickerContent(
  baileysMessage: proto.IWebMessageInfo,
  recipients: string[],
  delay: number,
  bot: WASocket,
) {
  let stickerPath: string | null = null;
  const { fullMessage } = extractDataFromMessage(baileysMessage);

  try {
    logger.info('🏷️ Baixando sticker da newsletter...');
    logger.debug(
      '🏷️ Estrutura da mensagem:',
      JSON.stringify(baileysMessage.message, null, 2),
    );
    stickerPath = (await downloadSticker(baileysMessage)) ?? null;
    logger.debug(`🏷️ Caminho do sticker baixado: ${stickerPath}`);    if (!stickerPath) {
      const stickerContent = getContent(baileysMessage, 'sticker') as proto.Message.IStickerMessage | undefined;
      logger.debug(
        '🏷️ Conteúdo do sticker encontrado:',
        JSON.stringify(stickerContent, null, 2),
      );
    }

    if (!stickerPath) {
      logger.warn('⚠️ Falha ao baixar sticker da newsletter');

      const sanitizedMessage = DataValidator.sanitizeText(fullMessage ?? '');
      const fallbackMessage = sanitizedMessage
        ? `📰 *NEWSLETTER* 📰\n\n🏷️ Sticker + ${sanitizedMessage}`
        : `📰 *NEWSLETTER* 📰\n\n🏷️ Sticker recebido`;
      await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
      return;
    }

    if (!fs.existsSync(stickerPath)) {
      logger.warn('⚠️ Arquivo de sticker não existe no caminho especificado');
      const sanitizedMessage = DataValidator.sanitizeText(fullMessage ?? '');
      const fallbackMessage = sanitizedMessage
        ? `📰 *NEWSLETTER* 📰\n\n🏷️ Sticker + ${sanitizedMessage}`
        : `📰 *NEWSLETTER* 📰\n\n🏷️ Sticker recebido`;
      await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
      return;
    }

    logger.info(`🏷️ Enviando sticker para ${recipients.length} destinatários`);
    await sendStickerToAllRecipients(recipients, delay, bot, stickerPath);

    if (fullMessage) {
      const sanitizedMessage = DataValidator.sanitizeText(fullMessage);
      const textMessage = `📰 *NEWSLETTER* 📰\n\n${sanitizedMessage}`;
      await sendTextToAllRecipients(recipients, delay, bot, textMessage);
    }
  } catch (error) {
    logger.error('❌ Erro ao processar sticker da newsletter:', error);
    const sanitizedMessage = DataValidator.sanitizeText(fullMessage ?? '');
    const fallbackMessage = sanitizedMessage
      ? `📰 *NEWSLETTER* 📰\n\n🏷️ Sticker + ${sanitizedMessage}`
      : `📰 *NEWSLETTER* 📰\n\n🏷️ Sticker recebido`;
    await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
  } finally {
    if (stickerPath && fs.existsSync(stickerPath)) {
      try {
        fs.unlinkSync(stickerPath);
        logger.debug(`🗑️ Arquivo temporário removido: ${stickerPath}`);
      } catch (cleanupError) {
        logger.warn('⚠️ Erro ao limpar arquivo temporário:', cleanupError);
      }
    }
  }
}

async function handleDocumentContent(
  baileysMessage: proto.IWebMessageInfo,
  recipients: string[],
  delay: number,
  bot: WASocket,
  fullMessage: string | undefined,
) {
  let documentPath: string | null = null;

  try {
    logger.info('📄 Baixando documento da newsletter...');    const documentContent = getContent(baileysMessage, 'document') as proto.Message.IDocumentMessage | undefined;
    const fileName = documentContent?.fileName ?? 'documento';
    const fileExtension = path.extname(fileName) ?? '.pdf';

    documentPath =
      (await downloadFile(baileysMessage, fileExtension.replace('.', ''))) ??
      null;

    if (!documentPath) {
      logger.warn('⚠️ Falha ao baixar documento da newsletter');
      const caption = documentContent?.caption ?? fullMessage ?? '';
      const sanitizedCaption = DataValidator.sanitizeText(caption);
      const fallbackMessage = sanitizedCaption
        ? `📰 *NEWSLETTER* 📰\n\n📄 Documento: ${fileName}\n\n${sanitizedCaption}`
        : `📰 *NEWSLETTER* 📰\n\n📄 Documento: ${fileName}`;
      await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
      return;
    }

    const caption = documentContent?.caption ?? fullMessage ?? '';
    const sanitizedCaption = DataValidator.sanitizeText(caption);
    const formattedCaption = `📰 *NEWSLETTER - DOCUMENTO* 📰\n\n${sanitizedCaption}\n\n🤖 Reencaminhado via ${general.BOT_NAME}`;

    await sendDocumentToAllRecipients(
      recipients,
      delay,
      bot,
      documentPath,
      fileName,
      formattedCaption,
    );
  } catch (error) {
    logger.error('❌ Erro ao processar documento da newsletter:', error);
    const documentContent = getContent(baileysMessage, 'document') as proto.Message.IDocumentMessage | undefined;
    const fileName = documentContent?.fileName ?? 'documento';
    const caption = documentContent?.caption ?? fullMessage ?? '';
    const sanitizedCaption = DataValidator.sanitizeText(caption);
    const fallbackMessage = sanitizedCaption
      ? `📰 *NEWSLETTER* 📰\n\n📄 Documento: ${fileName}\n\n${sanitizedCaption}`
      : `📰 *NEWSLETTER* 📰\n\n📄 Documento: ${fileName}`;
    await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
  } finally {
    if (documentPath && fs.existsSync(documentPath)) {
      try {
        fs.unlinkSync(documentPath);
        logger.debug(`🗑️ Arquivo temporário removido: ${documentPath}`);
      } catch (cleanupError) {
        logger.warn('⚠️ Erro ao limpar arquivo temporário:', cleanupError);
      }
    }
  }
}

async function handleAudioContent(
  baileysMessage: proto.IWebMessageInfo,
  recipients: string[],
  delay: number,
  bot: WASocket,
  fullMessage: string | undefined,
) {
  let audioPath: string | null = null;

  try {
    logger.info('🎵 Baixando áudio da newsletter...');

    audioPath = (await downloadAudio(baileysMessage)) ?? null;

    if (!audioPath) {
      logger.warn('⚠️ Falha ao baixar áudio da newsletter');
      const sanitizedMessage = DataValidator.sanitizeText(fullMessage ?? '');
      const fallbackMessage = sanitizedMessage
        ? `📰 *NEWSLETTER* 📰\n\n🎵 Áudio + ${sanitizedMessage}`
        : `📰 *NEWSLETTER* 📰\n\n🎵 Áudio recebido`;
      await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
      return;
    }    const audioContent = getContent(baileysMessage, 'audio') as proto.Message.IAudioMessage | undefined;
    const isPtt = audioContent?.ptt ?? false;
    await sendAudioToAllRecipients(recipients, delay, bot, audioPath, isPtt);

    if (fullMessage) {
      const sanitizedMessage = DataValidator.sanitizeText(fullMessage);
      const textMessage = `📰 *NEWSLETTER* 📰\n\n${sanitizedMessage}`;
      await sendTextToAllRecipients(recipients, delay, bot, textMessage);
    }
  } catch (error) {
    logger.error('❌ Erro ao processar áudio da newsletter:', error);
    const sanitizedMessage = DataValidator.sanitizeText(fullMessage ?? '');
    const fallbackMessage = sanitizedMessage
      ? `📰 *NEWSLETTER* 📰\n\n🎵 Áudio + ${sanitizedMessage}`
      : `📰 *NEWSLETTER* 📰\n\n🎵 Áudio recebido`;
    await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
  } finally {
    if (audioPath && fs.existsSync(audioPath)) {
      try {
        fs.unlinkSync(audioPath);
        logger.debug(`🗑️ Arquivo temporário removido: ${audioPath}`);
      } catch (cleanupError) {
        logger.warn('⚠️ Erro ao limpar arquivo temporário:', cleanupError);
      }
    }
  }
}

async function sendTextToAllRecipients(
  recipients: string[],
  delay: number,
  bot: WASocket,
  message?: string,
) {
  message ??= '';
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
        () => bot.sendMessage(recipient, { text: sanitizedMessage }),
        2,
        1000,
      );

      successCount++;
      logger.debug(`✅ Texto enviado para ${recipient}`);
    } catch (error) {
      failureCount++;
      logger.error(
        `❌ Falha definitiva ao enviar texto para ${recipient}:`,
        error,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  logger.info(
    `📊 Resumo do envio de texto: ${successCount} sucessos, ${failureCount} falhas`,
  );
  RateLimiter.cleanup();
}

async function sendImageToAllRecipients(
  recipients: string[],
  delay: number,
  bot: WASocket,
  imagePath: string,
  caption?: string,
) {
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
        () =>
          bot.sendMessage(recipient, {
            image: { url: imagePath },
            caption: caption,
          }),
        2,
        1000,
      );

      successCount++;
      logger.debug(`✅ Imagem enviada para ${recipient}`);
    } catch (error) {
      failureCount++;
      logger.error(
        `❌ Falha definitiva ao enviar imagem para ${recipient}:`,
        error,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  logger.info(
    `📊 Resumo do envio de imagem: ${successCount} sucessos, ${failureCount} falhas`,
  );
  RateLimiter.cleanup();
}

async function sendVideoToAllRecipients(
  recipients: string[],
  delay: number,
  bot: WASocket,
  videoPath: string,
  caption?: string,
) {
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
        () =>
          bot.sendMessage(recipient, {
            video: { url: videoPath },
            caption: caption,
          }),
        2,
        1000,
      );

      successCount++;
      logger.debug(`✅ Vídeo enviado para ${recipient}`);
    } catch (error) {
      failureCount++;
      logger.error(
        `❌ Falha definitiva ao enviar vídeo para ${recipient}:`,
        error,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  logger.info(
    `📊 Resumo do envio de vídeo: ${successCount} sucessos, ${failureCount} falhas`,
  );
  RateLimiter.cleanup();
}

async function sendStickerToAllRecipients(
  recipients: string[],
  delay: number,
  bot: WASocket,
  stickerPath: string,
) {
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
        () =>
          bot.sendMessage(recipient, {
            sticker: { url: stickerPath },
          }),
        2,
        1000,
      );

      successCount++;
      logger.debug(`✅ Sticker enviado para ${recipient}`);
    } catch (error) {
      failureCount++;
      logger.error(
        `❌ Falha definitiva ao enviar sticker para ${recipient}:`,
        error,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  logger.info(
    `📊 Resumo do envio de sticker: ${successCount} sucessos, ${failureCount} falhas`,
  );
  RateLimiter.cleanup();
}

async function sendDocumentToAllRecipients(
  recipients: string[],
  delay: number,
  bot: WASocket,
  documentPath: string,
  fileName: string,
  caption?: string,
) {
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
        () =>
          bot.sendMessage(recipient, {
            document: { url: documentPath },
            fileName: fileName,
            caption: caption,
            mimetype: 'application/octet-stream',
          }),
        2,
        1000,
      );

      successCount++;
      logger.debug(`✅ Documento enviado para ${recipient}`);
    } catch (error) {
      failureCount++;
      logger.error(
        `❌ Falha definitiva ao enviar documento para ${recipient}:`,
        error,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  logger.info(
    `📊 Resumo do envio de documento: ${successCount} sucessos, ${failureCount} falhas`,
  );
  RateLimiter.cleanup();
}

async function sendAudioToAllRecipients(
  recipients: string[],
  delay: number,
  bot: WASocket,
  audioPath: string,
  ptt: boolean = false,
  caption?: string,
) {
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
      const audioMessage: any = {
        audio: { url: audioPath },
        ptt: ptt,
      };

      if (!ptt && caption) {
        audioMessage.caption = caption;
      }

      await ErrorRecovery.retryOperation(
        () => bot.sendMessage(recipient, audioMessage),
        2,
        1000,
      );

      successCount++;
      logger.debug(`✅ Áudio enviado para ${recipient}`);
    } catch (error) {
      failureCount++;
      logger.error(
        `❌ Falha definitiva ao enviar áudio para ${recipient}:`,
        error,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  logger.info(
    `📊 Resumo do envio de áudio: ${successCount} sucessos, ${failureCount} falhas`,
  );
  RateLimiter.cleanup();
}
