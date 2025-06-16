import {
  WASocket,
  isJidNewsletter,
  proto,
  DownloadableMessage,
  MediaType,
} from 'baileys';
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
    message?.viewOnceMessageV2?.message?.[
    `${type}Message` as keyof typeof message
    ];

  content ??=
    message?.ephemeralMessage?.message?.[
    `${type}Message` as keyof typeof message
    ];

  if (content) {
    logger.debug(
      `📰 Conteúdo ${type} encontrado em newsletter:`,
      JSON.stringify(content, null, 2),
    );
  } else {
    logger.debug(
      `📰 Conteúdo ${type} NÃO encontrado em newsletter. Estrutura da mensagem:`,
      JSON.stringify(message, null, 2),
    );
  }

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
      const { downloadContentFromMessage } = await import('baileys');
      if (typeof content === 'object' && content !== null && 'url' in content) {
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

function analyzeNewsletterStructure(baileysMessage: proto.IWebMessageInfo) {
  const message = baileysMessage.message;
  const analysis = {
    messageKeys: Object.keys(message || {}),
    hasDirectMedia: false,
    hasNestedMedia: false,
    possibleStructures: [] as string[],
    mediaTypes: [] as string[],
  };

  if (!message) return analysis;

  const mediaTypes = ['image', 'video', 'audio', 'document', 'sticker'];

  for (const type of mediaTypes) {
    const typeKey = `${type}Message`;

    if (message[typeKey as keyof typeof message]) {
      analysis.hasDirectMedia = true;
      analysis.mediaTypes.push(type);
      analysis.possibleStructures.push(`message.${typeKey}`);
    }

    if (
      message.extendedTextMessage?.contextInfo?.quotedMessage?.[
      typeKey as keyof typeof message
      ]
    ) {
      analysis.hasNestedMedia = true;
      analysis.mediaTypes.push(`quoted-${type}`);
      analysis.possibleStructures.push(
        `message.extendedTextMessage.contextInfo.quotedMessage.${typeKey}`,
      );
    }

    if (message.viewOnceMessage?.message?.[typeKey as keyof typeof message]) {
      analysis.hasNestedMedia = true;
      analysis.mediaTypes.push(`viewonce-${type}`);
      analysis.possibleStructures.push(
        `message.viewOnceMessage.message.${typeKey}`,
      );
    }

    if (message.viewOnceMessageV2?.message?.[typeKey as keyof typeof message]) {
      analysis.hasNestedMedia = true;
      analysis.mediaTypes.push(`viewoncev2-${type}`);
      analysis.possibleStructures.push(
        `message.viewOnceMessageV2.message.${typeKey}`,
      );
    }

    if (message.ephemeralMessage?.message?.[typeKey as keyof typeof message]) {
      analysis.hasNestedMedia = true;
      analysis.mediaTypes.push(`ephemeral-${type}`);
      analysis.possibleStructures.push(
        `message.ephemeralMessage.message.${typeKey}`,
      );
    }
  }

  return analysis;
}

export default async (bot: WASocket, baileysMessage: proto.IWebMessageInfo) => {
  if (!baileysMessage?.key?.remoteJid) return;
  if (!isJidNewsletter(baileysMessage.key.remoteJid)) return;

  logger.info('📰 Newsletter detectada! Reenviando para todos os usuários...');

  const structureAnalysis = analyzeNewsletterStructure(baileysMessage);
  logger.debug('📰 Análise da estrutura da newsletter:', structureAnalysis);

  logger.debug(
    '📰 Estrutura completa da mensagem de newsletter:',
    JSON.stringify(baileysMessage, null, 2),
  );

  logger.debug('📰 Análise detalhada da estrutura:');
  logger.debug(`- message keys: ${Object.keys(baileysMessage.message || {})}`);
  logger.debug(`- message: ${JSON.stringify(baileysMessage.message, null, 2)}`);

  if (baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    logger.debug(
      '📰 Mensagem quotada encontrada:',
      JSON.stringify(
        baileysMessage.message.extendedTextMessage.contextInfo.quotedMessage,
        null,
        2,
      ),
    );
  }

  if (baileysMessage.message?.viewOnceMessage?.message) {
    logger.debug(
      '📰 ViewOnceMessage encontrada:',
      JSON.stringify(baileysMessage.message.viewOnceMessage.message, null, 2),
    );
  }

  if (baileysMessage.message?.ephemeralMessage?.message) {
    logger.debug(
      '📰 EphemeralMessage encontrada:',
      JSON.stringify(baileysMessage.message.ephemeralMessage.message, null, 2),
    );
  }
  logger.debug('📰 Tipos de mensagem detectados (baileysIs):');
  logger.debug(`- É imagem: ${baileysIs(baileysMessage, 'image')}`);
  logger.debug(`- É vídeo: ${baileysIs(baileysMessage, 'video')}`);
  logger.debug(`- É sticker: ${baileysIs(baileysMessage, 'sticker')}`);
  logger.debug(`- É documento: ${baileysIs(baileysMessage, 'document')}`);
  logger.debug(`- É áudio: ${baileysIs(baileysMessage, 'audio')}`);
  logger.debug(`- É poll: ${!!baileysMessage.message?.pollCreationMessageV3}`);

  logger.debug('📰 Testando getContent:');
  logger.debug(
    `- getContent(image): ${JSON.stringify(
      getContent(baileysMessage, 'image'),
      null,
      2,
    )}`,
  );
  logger.debug(
    `- getContent(video): ${JSON.stringify(
      getContent(baileysMessage, 'video'),
      null,
      2,
    )}`,
  );
  logger.debug(
    `- getContent(sticker): ${JSON.stringify(
      getContent(baileysMessage, 'sticker'),
      null,
      2,
    )}`,
  );
  logger.debug(
    `- getContent(document): ${JSON.stringify(
      getContent(baileysMessage, 'document'),
      null,
      2,
    )}`,
  );
  logger.debug(
    `- getContent(audio): ${JSON.stringify(
      getContent(baileysMessage, 'audio'),
      null,
      2,
    )}`,
  );

  logger.debug('📰 Testando getNewsletterContent:');
  logger.debug(
    `- getNewsletterContent(image): ${JSON.stringify(
      getNewsletterContent(baileysMessage, 'image'),
      null,
      2,
    )}`,
  );
  logger.debug(
    `- getNewsletterContent(video): ${JSON.stringify(
      getNewsletterContent(baileysMessage, 'video'),
      null,
      2,
    )}`,
  );
  logger.debug(
    `- getNewsletterContent(sticker): ${JSON.stringify(
      getNewsletterContent(baileysMessage, 'sticker'),
      null,
      2,
    )}`,
  );
  logger.debug(
    `- getNewsletterContent(document): ${JSON.stringify(
      getNewsletterContent(baileysMessage, 'document'),
      null,
      2,
    )}`,
  );
  logger.debug(
    `- getNewsletterContent(audio): ${JSON.stringify(
      getNewsletterContent(baileysMessage, 'audio'),
      null,
      2,
    )}`,
  );

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

  // Verifica se é uma poll (enquete)
  if (baileysMessage.message?.pollCreationMessageV3) {
    await handlePollContent(baileysMessage, recipients, delay, bot);
    return;
  }

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
    logger.info('📷 Processando imagem da newsletter...');
    // Primeiro, tenta obter o conteúdo da imagem diretamente
    const imageContentDirect = getNewsletterContent(baileysMessage, 'image') as any;

    logger.debug('📷 Dados da imagem obtidos:', JSON.stringify(imageContentDirect, null, 2));

    if (imageContentDirect?.url) {
      logger.info('📷 Enviando imagem usando dados diretos da newsletter...');
      logger.debug('📷 URL da imagem:', imageContentDirect.url);
      logger.debug('📷 Tipo de arquivo:', imageContentDirect.mimetype);
      logger.debug('📷 Dimensões:', `${imageContentDirect.width}x${imageContentDirect.height}`);
      logger.debug('📷 Caption:', imageContentDirect.caption);

      const caption = imageContentDirect.caption ?? fullMessage ?? '';
      const sanitizedCaption = DataValidator.sanitizeText(caption);
      const formattedCaption = sanitizedCaption
        ? `📰 *NEWSLETTER* 📰\n\n${sanitizedCaption}`
        : `📰 *NEWSLETTER* 📰`;

      await sendImageDirectToAllRecipients(recipients, delay, bot, imageContentDirect, formattedCaption);
      return;
    }

    logger.info('📷 Tentando baixar imagem da newsletter...');
    logger.debug(
      '📷 Estrutura da mensagem:',
      JSON.stringify(baileysMessage.message, null, 2),
    );

    logger.debug('📷 Tentando download padrão...');
    imagePath = (await downloadImage(baileysMessage)) ?? null;
    logger.debug(`📷 Resultado do download padrão: ${imagePath}`);

    if (!imagePath) {
      const imageContentFallback = getContent(baileysMessage, 'image') as
        | proto.Message.IImageMessage
        | undefined;
      logger.debug(
        '📷 Conteúdo da imagem (getContent):',
        JSON.stringify(imageContentFallback, null, 2),
      );

      const newsletterImageContent = getNewsletterContent(
        baileysMessage,
        'image',
      );
      logger.debug(
        '📷 Conteúdo da imagem (getNewsletterContent):',
        JSON.stringify(newsletterImageContent, null, 2),
      );

      if (newsletterImageContent) {
        logger.debug('📷 Tentando download específico de newsletter...');
        imagePath = await downloadNewsletterContent(
          baileysMessage,
          'newsletter_image',
          'image',
          'png',
        );
        logger.debug(`📷 Resultado do download específico: ${imagePath}`);
      }
    }

    if (!imagePath) {
      logger.warn('⚠️ Falha ao baixar imagem da newsletter');
      const imageContentFallback = getContent(baileysMessage, 'image') as
        | proto.Message.IImageMessage
        | undefined;
      const caption = imageContentFallback?.caption ?? fullMessage ?? '';
      const sanitizedCaption = DataValidator.sanitizeText(caption);
      const fallbackMessage = sanitizedCaption
        ? `📰 *NEWSLETTER* 📰\n\n${sanitizedCaption}`
        : `📰 *NEWSLETTER* 📰`;
      await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
      return;
    }

    if (!fs.existsSync(imagePath)) {
      logger.warn('⚠️ Arquivo de imagem não existe no caminho especificado');
      const imageContent = getContent(baileysMessage, 'image') as
        | proto.Message.IImageMessage
        | undefined;
      const caption = imageContent?.caption ?? fullMessage ?? '';
      const sanitizedCaption = DataValidator.sanitizeText(caption);
      const fallbackMessage = sanitizedCaption
        ? `📰 *NEWSLETTER* 📰\n\n${sanitizedCaption}`
        : `📰 *NEWSLETTER* 📰`;
      await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
      return;
    }

    const imageContent = getContent(baileysMessage, 'image') as
      | proto.Message.IImageMessage
      | undefined;
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
    const imageContent = getContent(baileysMessage, 'image') as
      | proto.Message.IImageMessage
      | undefined;
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
    logger.info('🎥 Processando vídeo da newsletter...');

    const videoContentDirect = getNewsletterContent(baileysMessage, 'video') as any;

    logger.debug('🎥 Dados do vídeo obtidos:', JSON.stringify(videoContentDirect, null, 2));

    if (videoContentDirect?.url) {
      logger.info('🎥 Enviando vídeo usando dados diretos da newsletter...');
      logger.debug('🎥 URL do vídeo:', videoContentDirect.url);
      logger.debug('🎥 Tipo de arquivo:', videoContentDirect.mimetype);
      logger.debug('🎥 Caption:', videoContentDirect.caption);

      const caption = videoContentDirect.caption ?? fullMessage ?? '';
      const sanitizedCaption = DataValidator.sanitizeText(caption);
      const formattedCaption = sanitizedCaption
        ? `📰 *NEWSLETTER* 📰\n\n${sanitizedCaption}`
        : `📰 *NEWSLETTER* 📰`;

      await sendVideoDirectToAllRecipients(recipients, delay, bot, videoContentDirect, formattedCaption);
      return;
    }

    logger.info('🎥 Tentando baixar vídeo da newsletter...');

    videoPath = (await downloadVideo(baileysMessage)) ?? null;
    if (!videoPath) {
      logger.warn('⚠️ Falha ao baixar vídeo da newsletter');
      const videoContent = getContent(baileysMessage, 'video') as
        | proto.Message.IVideoMessage
        | undefined;
      const caption = videoContent?.caption ?? fullMessage ?? '';
      const sanitizedCaption = DataValidator.sanitizeText(caption);
      const fallbackMessage = sanitizedCaption
        ? `📰 *NEWSLETTER* 📰\n\n${sanitizedCaption}`
        : `📰 *NEWSLETTER* 📰`;
      await sendTextToAllRecipients(recipients, delay, bot, fallbackMessage);
      return;
    }

    const videoContent = getContent(baileysMessage, 'video') as
      | proto.Message.IVideoMessage
      | undefined;
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
    const videoContent = getContent(baileysMessage, 'video') as
      | proto.Message.IVideoMessage
      | undefined;
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
    logger.info('🏷️ Processando sticker da newsletter...');

    const stickerContent = getNewsletterContent(baileysMessage, 'sticker') as any;

    logger.debug('🏷️ Dados do sticker obtidos:', JSON.stringify(stickerContent, null, 2));

    if (stickerContent?.url) {
      logger.info('🏷️ Enviando sticker usando dados diretos da newsletter...');
      logger.debug('🏷️ URL do sticker:', stickerContent.url);
      logger.debug('🏷️ Tipo de arquivo:', stickerContent.mimetype);
      logger.debug('🏷️ É animado:', stickerContent.isAnimated);

      await sendStickerDirectToAllRecipients(recipients, delay, bot, stickerContent);

      return;
    }

    logger.info('🏷️ Tentando baixar sticker da newsletter...');
    logger.debug(
      '🏷️ Estrutura da mensagem:',
      JSON.stringify(baileysMessage.message, null, 2),
    );
    stickerPath = (await downloadSticker(baileysMessage)) ?? null;
    logger.debug(`🏷️ Caminho do sticker baixado: ${stickerPath}`);

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
    logger.info('📄 Baixando documento da newsletter...');
    const documentContent = getContent(baileysMessage, 'document') as
      | proto.Message.IDocumentMessage
      | undefined;
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
    const documentContent = getContent(baileysMessage, 'document') as
      | proto.Message.IDocumentMessage
      | undefined;
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
    }
    const audioContent = getContent(baileysMessage, 'audio') as
      | proto.Message.IAudioMessage
      | undefined;
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

async function sendStickerDirectToAllRecipients(
  recipients: string[],
  delay: number,
  bot: WASocket,
  stickerData: any,
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
        async () => {
          try {
            await bot.sendMessage(recipient, {
              sticker: { url: stickerData.url }
            });
            return;
          } catch (error) {
            logger.debug(`Tentativa com URL simples falhou, tentando com estrutura completa:`, error);
          }

          const stickerMessage = {
            sticker: stickerData
          };

          await bot.sendMessage(recipient, stickerMessage);
        },
        2,
        1000,
      );

      successCount++;
      logger.debug(`✅ Sticker direto enviado para ${recipient}`);
    } catch (error) {
      failureCount++;
      logger.error(
        `❌ Falha definitiva ao enviar sticker direto para ${recipient}:`,
        error,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  logger.info(
    `📊 Resumo do envio de sticker direto: ${successCount} sucessos, ${failureCount} falhas`,
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

async function sendImageDirectToAllRecipients(
  recipients: string[],
  delay: number,
  bot: WASocket,
  imageData: any,
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
        async () => {
          try {
            await bot.sendMessage(recipient, {
              image: { url: imageData.url },
              caption: caption,
            });
            return;
          } catch (error) {
            logger.debug(`Tentativa com URL simples falhou, tentando com estrutura completa:`, error);
          }

          const imageMessage = {
            image: imageData,
            caption: caption,
          };

          await bot.sendMessage(recipient, imageMessage);
        },
        2,
        1000,
      );

      successCount++;
      logger.debug(`✅ Imagem direta enviada para ${recipient}`);
    } catch (error) {
      failureCount++;
      logger.error(
        `❌ Falha definitiva ao enviar imagem direta para ${recipient}:`,
        error,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  logger.info(
    `📊 Resumo do envio de imagem direta: ${successCount} sucessos, ${failureCount} falhas`,
  );
  RateLimiter.cleanup();
}

async function sendVideoDirectToAllRecipients(
  recipients: string[],
  delay: number,
  bot: WASocket,
  videoData: any,
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
        async () => {
          try {
            await bot.sendMessage(recipient, {
              video: { url: videoData.url },
              caption: caption,
            });
            return;
          } catch (error) {
            logger.debug(`Tentativa com URL simples falhou, tentando com estrutura completa:`, error);
          }

          const videoMessage = {
            video: videoData,
            caption: caption,
          };

          await bot.sendMessage(recipient, videoMessage);
        },
        2,
        1000,
      );

      successCount++;
      logger.debug(`✅ Vídeo direto enviado para ${recipient}`);
    } catch (error) {
      failureCount++;
      logger.error(
        `❌ Falha definitiva ao enviar vídeo direto para ${recipient}:`,
        error,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  logger.info(
    `📊 Resumo do envio de vídeo direto: ${successCount} sucessos, ${failureCount} falhas`,
  );
  RateLimiter.cleanup();
}

async function handlePollContent(
  baileysMessage: proto.IWebMessageInfo,
  recipients: string[],
  delay: number,
  bot: WASocket,
) {
  try {
    logger.info('📊 Processando enquete da newsletter...');

    const pollData = baileysMessage.message?.pollCreationMessageV3;

    if (!pollData) {
      logger.warn('⚠️ Dados da enquete não encontrados');
      return;
    }

    logger.debug('📊 Dados da enquete:', JSON.stringify(pollData, null, 2));

    const groupRecipients = recipients.filter(jid => jid.endsWith('@g.us'));

    if (groupRecipients.length === 0) {
      logger.info('📊 Nenhum grupo configurado para receber enquetes');
      return;
    }

    logger.info(`📊 Enviando enquete para ${groupRecipients.length} grupos`);
    logger.debug('📊 Nome da enquete:', pollData.name);
    logger.debug('📊 Opções:', pollData.options?.map(opt => opt.optionName));

    await sendPollToGroups(groupRecipients, delay, bot, pollData);

  } catch (error) {
    logger.error('❌ Erro ao processar enquete da newsletter:', error);
  }
}

async function sendPollToGroups(
  groupRecipients: string[],
  delay: number,
  bot: WASocket,
  pollData: any,
) {
  let successCount = 0;
  let failureCount = 0;

  for (const groupJid of groupRecipients) {
    if (!DataValidator.isValidJid(groupJid)) {
      logger.warn(`⚠️ JID inválido ignorado: ${groupJid}`);
      failureCount++;
      continue;
    }

    if (!RateLimiter.canSend(groupJid)) {
      logger.warn(`🚫 Rate limit atingido para ${groupJid}`);
      failureCount++;
      continue;
    }

    try {
      await ErrorRecovery.retryOperation(
        async () => {
          const pollMessage = {
            poll: {
              name: pollData.name,
              values: pollData.options?.map((opt: any) => opt.optionName) || [],
              selectableCount: pollData.selectableOptionsCount || 1,
            }
          };

          await bot.sendMessage(groupJid, {
            text: `📰 *NEWSLETTER - ${pollData.name}* 📰`,
          })
          await bot.sendMessage(groupJid, pollMessage);

        },
        2,
        1000,
      );

      successCount++;
      logger.debug(`✅ Enquete enviada para grupo ${groupJid}`);
    } catch (error) {
      failureCount++;
      logger.error(
        `❌ Falha definitiva ao enviar enquete para grupo ${groupJid}:`,
        error,
      );

      try {
        const pollName = pollData.name || 'Enquete';
        const options = pollData.options?.map((opt: any) => `• ${opt.optionName}`).join('\n') || '';
        const fallbackMessage = `📰 *NEWSLETTER* 📰\n\n📊 ${pollName}\n\n${options}`;

        await bot.sendMessage(groupJid, { text: fallbackMessage });
        logger.debug(`✅ Enquete enviada como texto para grupo ${groupJid}`);
        successCount++;
      } catch (textError) {
        logger.error(`❌ Falha ao enviar enquete como texto para ${groupJid}:`, textError);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  logger.info(
    `📊 Resumo do envio de enquetes: ${successCount} sucessos, ${failureCount} falhas`,
  );
  RateLimiter.cleanup();
}
