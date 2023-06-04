import Stripe from 'stripe'
import { backfillCustomers } from './customers'
import { getUniqueIds, upsertMany } from './database_utils'

const PRISMA_MODEL_NAME = 'setupIntent'

export const upsertSetupIntents = async (setupIntents: Stripe.SetupIntent[]): Promise<Stripe.SetupIntent[]> => {
  await backfillCustomers(getUniqueIds(setupIntents, 'customer'))

  return upsertMany(PRISMA_MODEL_NAME, setupIntents)
}
