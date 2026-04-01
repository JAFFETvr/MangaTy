/**
 * GetCreatorWallet Use Case
 */

import { CreatorWallet } from '../entities';
import { IEarningsRepository } from '../repositories';

export class GetCreatorWallet {
  constructor(private earningsRepository: IEarningsRepository) {}

  async execute(creatorId: string): Promise<CreatorWallet> {
    return this.earningsRepository.getCreatorWallet(creatorId);
  }
}
