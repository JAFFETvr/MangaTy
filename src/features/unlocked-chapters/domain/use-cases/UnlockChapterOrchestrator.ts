/**
 * UnlockChapterOrchestrator Use Case
 * 
 * Este use case ORQUESTA TODO EL FLUJO DE NEGOCIO:
 * 1. Valida balance del usuario
 * 2. Gasta monedas del usuario
 * 3. Desbloquea el capítulo
 * 4. Calcula y registra earnings 80/20
 * 5. Registra transacción en wallet
 * 6. Actualiza balance del creador
 * 
 * Es el CORAZÓN del modelo de negocio Mangaty.
 */

import { COIN_TO_MXN } from '@/src/features/coins/domain/entities';
import { ICreatorRepository } from '@/src/features/creators/domain/repositories';
import { IEarningsRepository } from '@/src/features/earnings/domain/repositories';
import { IUnlockedChapterRepository } from '@/src/features/unlocked-chapters/domain/repositories';
import { IUserRepository } from '@/src/features/user/domain/repositories/user-repository';
import { IWalletRepository } from '@/src/features/wallet/domain/repositories';

export interface UnlockChapterResult {
  success: boolean;
  message: string;
  newBalance: number;
  creatorEarned: number;  // MXN que ganó el creador
  platformFee: number;    // MXN que ganó la plataforma
}

export class UnlockChapterOrchestrator {
  constructor(
    private userRepository: IUserRepository,
    private unlockedChapterRepository: IUnlockedChapterRepository,
    private earningsRepository: IEarningsRepository,
    private walletRepository: IWalletRepository,
    private creatorRepository: ICreatorRepository
  ) {}

  async execute(
    userId: string,
    mangaId: number,
    chapterNumber: number,
    creatorId: string,
    cost: number  // Costo en monedas
  ): Promise<UnlockChapterResult> {
    console.log(`\n========================================`);
    console.log(`🔓 UNLOCK CHAPTER ORCHESTRATOR`);
    console.log(`========================================`);
    console.log(`User: ${userId}`);
    console.log(`Manga: ${mangaId}, Chapter: ${chapterNumber}`);
    console.log(`Creator: ${creatorId}`);
    console.log(`Cost: ${cost} coins`);

    try {
      // 1. Validar que el capítulo no esté ya desbloqueado
      const alreadyUnlocked = await this.unlockedChapterRepository.isChapterUnlocked(
        userId,
        mangaId,
        chapterNumber
      );

      if (alreadyUnlocked) {
        console.log(`❌ Chapter already unlocked`);
        const balance = await this.userRepository.getUserCoinBalance();
        return {
          success: false,
          message: 'Este capítulo ya está desbloqueado',
          newBalance: balance,
          creatorEarned: 0,
          platformFee: 0,
        };
      }

      // 2. Validar balance del usuario
      console.log(`\n📊 Step 1: Validating user balance...`);
      const balance = await this.userRepository.getUserCoinBalance();
      console.log(`   Current balance: ${balance} coins`);

      if (balance < cost) {
        console.log(`   ❌ Insufficient balance (needs ${cost} coins)`);
        return {
          success: false,
          message: `Saldo insuficiente. Tienes ${balance} monedas pero necesitas ${cost}.`,
          newBalance: balance,
          creatorEarned: 0,
          platformFee: 0,
        };
      }

      // 3. Gastar monedas del usuario
      console.log(`\n💰 Step 2: Spending ${cost} coins...`);
      const newBalance = await this.userRepository.spendCoins(cost);
      console.log(`   ✅ New balance: ${newBalance} coins`);

      // 4. Desbloquear capítulo
      console.log(`\n🔓 Step 3: Unlocking chapter...`);
      await this.unlockedChapterRepository.unlockChapterWithCoins(
        userId,
        mangaId,
        chapterNumber,
        cost
      );
      console.log(`   ✅ Chapter unlocked`);

      // 5. Calcular valores en MXN
      const amountMXN = cost * COIN_TO_MXN;
      const creatorRevenue = amountMXN * 0.80;  // 80% al creador
      const platformFee = amountMXN * 0.20;     // 20% a la plataforma

      // 6. Registrar earnings del creador (80/20 split)
      console.log(`\n💵 Step 4: Recording earnings (80/20 split)...`);
      console.log(`   Total: $${amountMXN} MXN`);
      console.log(`   Creator (80%): $${creatorRevenue.toFixed(2)} MXN`);
      console.log(`   Platform (20%): $${platformFee.toFixed(2)} MXN`);

      await this.earningsRepository.recordChapterPurchase(
        creatorId,
        mangaId,
        chapterNumber,
        userId,
        cost,
        amountMXN
      );
      console.log(`   ✅ Earnings recorded`);

      // 7. Registrar transacción en wallet
      console.log(`\n📝 Step 5: Recording wallet transaction...`);
      await this.walletRepository.recordSpend(
        userId,
        cost,
        amountMXN,
        mangaId,
        chapterNumber,
        creatorId
      );
      console.log(`   ✅ Transaction recorded`);

      // 8. Actualizar balance del creador
      console.log(`\n💼 Step 6: Updating creator balance...`);
      await this.creatorRepository.addEarnings(creatorId, creatorRevenue);
      console.log(`   ✅ Creator balance updated`);

      console.log(`\n========================================`);
      console.log(`✅ CHAPTER UNLOCKED SUCCESSFULLY!`);
      console.log(`========================================\n`);

      return {
        success: true,
        message: `¡Capítulo ${chapterNumber} desbloqueado!`,
        newBalance,
        creatorEarned: creatorRevenue,
        platformFee,
      };
    } catch (error) {
      console.log(`\n❌ ERROR in unlock orchestrator:`);
      console.error(error);

      const balance = await this.userRepository.getUserCoinBalance();
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al desbloquear capítulo',
        newBalance: balance,
        creatorEarned: 0,
        platformFee: 0,
      };
    }
  }
}
