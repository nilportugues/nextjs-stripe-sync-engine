import Stripe from 'stripe'
import { backfillCharges } from './charges'
import { getUniqueIds, upsertMany } from './database_utils'

const PRISMA_MODEL_NAME = 'dispute'

export const upsertDisputes = async (disputes: Stripe.Dispute[]): Promise<Stripe.Dispute[]> => {
  await backfillCharges(getUniqueIds(disputes, 'charge'))

  return upsertMany(PRISMA_MODEL_NAME, disputes)
}
