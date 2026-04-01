/**
 * RecordChapterPurchase Use Case
 * 
 * Este es el use case MÁS IMPORTANTE del negocio.
 * Cuando un usuario desbloquea un capítulo con monedas:
 * 1. Calcula el reparto 80/20
 * 2. Registra la ganancia del creador
 * 3. Actualiza el balance del creador
 */

import { COIN_TO_MXN } from '@/src/features/coins/domain/entities';
import { CreatorEarnings } from '../entities';
import { IEarningsRepository } from '../repositories';

export class RecordChapterPurchase {
  constructor(private earningsRepository: IEarningsRepository) {}

  async execute(
    creatorId: string,
    mangaId: number,
    chapterNumber: number,
    userId: string,
    coinsPaid: number
  ): Promise<CreatorEarnings> {
    // Convertir monedas a MXN
    const amountMXN = coinsPaid * COIN_TO_MXN;

    // Calcular reparto 80/20
    const creatorRevenue = amountMXN * 0.80;  // 80% al creador
    const platformFee = amountMXN * 0.20;     // 20% a la plataforma

    console.log(`[Earnings] Chapter purchase:`);
    console.log(`  - Total: ${coinsPaid} coins ($${amountMXN} MXN)`);
    console.log(`  - Creator (80%): $${creatorRevenue.toFixed(2)} MXN`);
    console.log(`  - Platform (20%): $${platformFee.toFixed(2)} MXN`);

    return this.earningsRepository.recordChapterPurchase(
      creatorId,
      mangaId,
      chapterNumber,
      userId,
      coinsPaid,
      amountMXN
    );
  }
}
