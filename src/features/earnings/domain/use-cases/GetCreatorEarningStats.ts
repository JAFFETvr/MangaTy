/**
 * GetCreatorEarningStats - Get earnings statistics for a creator
 */

import { IEarningsRepository } from '../repositories';

export interface EarningStats {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
}

export class GetCreatorEarningStats {
  constructor(private repository: IEarningsRepository) {}

  async execute(creatorId: string): Promise<EarningStats> {
    const earnings = await this.repository.getCreatorEarnings(creatorId);
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;

    for (const earning of earnings) {
      const earningDate = new Date(earning.createdAt);
      
      if (earningDate >= startOfDay) {
        todayEarnings += earning.creatorRevenue;
      }
      if (earningDate >= startOfWeek) {
        weekEarnings += earning.creatorRevenue;
      }
      if (earningDate >= startOfMonth) {
        monthEarnings += earning.creatorRevenue;
      }
    }

    return { todayEarnings, weekEarnings, monthEarnings };
  }
}
