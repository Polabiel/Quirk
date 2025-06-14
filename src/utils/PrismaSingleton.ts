import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

class PrismaSingleton {
  private static instance: PrismaClient | null = null;
  private static isConnected = false;
  public static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      PrismaSingleton.instance = new PrismaClient({
        log: ['error', 'warn'],
        errorFormat: 'pretty',
      });

      PrismaSingleton.connect();
    }

    return PrismaSingleton.instance;
  }

  private static async connect(): Promise<void> {
    if (PrismaSingleton.isConnected || !PrismaSingleton.instance) return;

    try {
      await PrismaSingleton.instance.$connect();
      PrismaSingleton.isConnected = true;
      logger.info('✅ Prisma conectado ao banco de dados');
    } catch (error) {
      logger.error('❌ Erro ao conectar Prisma:', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    if (PrismaSingleton.instance && PrismaSingleton.isConnected) {
      try {
        await PrismaSingleton.instance.$disconnect();
        PrismaSingleton.isConnected = false;
        logger.info('🔌 Prisma desconectado do banco de dados');
      } catch (error) {
        logger.error('❌ Erro ao desconectar Prisma:', error);
      }
    }
  }

  public static async healthCheck(): Promise<boolean> {
    if (!PrismaSingleton.instance) return false;

    try {
      await PrismaSingleton.instance.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('❌ Health check do Prisma falhou:', error);
      return false;
    }
  }
}

export default PrismaSingleton;
