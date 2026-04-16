import { httpClient } from '@/src/core/http/http-client';
import { CoinPackage } from '../../domain/entities';

interface CoinPackageResponse {
  id: string;
  name: string;
  tyCoinsAmount: number;
  bonusCoins: number;
  totalCoins: number;
  priceMxn: number;
}

interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export class CoinRemoteDataSource {
  async getPackages(): Promise<CoinPackage[]> {
    try {
      const packages = await httpClient.get<CoinPackageResponse[]>('/payments/packages');

      return packages.map((item) => ({
        id: item.id,
        coins: item.totalCoins,
        bonus: item.bonusCoins,
        price: `$${(item.priceMxn / 20).toFixed(2)} USD`,
        priceMXN: item.priceMxn,
        popular: item.name ? item.name.toLowerCase().includes('popular') : false,
        best: item.name ? (item.name.toLowerCase().includes('máximo') || item.name.toLowerCase().includes('best')) : false,
      }));
    } catch (error) {
      console.error('❌ Error fetching coin packages:', error);
      throw error;
    }
  }

  async checkout(packageId: string, idempotencyKey: string): Promise<string> {
    try {
      const response = await httpClient.postWithHeaders<CheckoutResponse>(
        '/payments/checkout',
        {
          packageId,
          idempotencyKey,
        },
        {
          'X-Idempotency-Key': idempotencyKey,
        }
      );

      if (!response.checkoutUrl) {
        throw new Error('No checkout URL in response');
      }

      return response.checkoutUrl;
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Get current user's TyCoins balance
   */
  async getBalance(): Promise<number> {
    try {
      const response = await httpClient.get<{ userId: string; tyCoins: number }>('/wallet/balance');
      return response.tyCoins;
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
      throw error;
    }
  }
}
