import { CoinPackage } from '../../domain/entities';

export class CoinRemoteDataSource {
  async getPackages(): Promise<CoinPackage[]> {
    const response = await fetch('https://api.angeldev.fun/api/payments/packages');
    if (!response.ok) {
      throw new Error('Error al obtener paquetes de monedas remotos');
    }
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      coins: item.totalCoins,
      bonus: item.bonusCoins,
      price: `$${(item.priceMxn / 20).toFixed(2)} USD`,
      priceMXN: item.priceMxn,
      popular: item.name ? item.name.toLowerCase().includes('popular') : false,
      best: item.name ? (item.name.toLowerCase().includes('valor') || item.name.toLowerCase().includes('value')) : false,
    }));
  }

  async checkout(packageId: string, idempotencyKey: string): Promise<string> {
    const response = await fetch('https://api.angeldev.fun/api/payments/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packageId,
        idempotencyKey,
      }),
    });

    if (!response.ok) {
      throw new Error('Falló la creación de sesión en Stripe');
    }

    const data = await response.json();
    if (!data.checkoutUrl) {
      throw new Error('La respuesta del servidor no incluyó una URL de checkout');
    }

    return data.checkoutUrl;
  }
}
