import { getConfig } from '../utils/config'
import Stripe from 'stripe'

import { backfillCustomers } from './customers'
import { getUniqueIds, upsertMany } from './database_utils'


export const upsertSetupIntents = async (
  setupIntents: Stripe.SetupIntent[]
): Promise<Stripe.SetupIntent[]> => {
  await backfillCustomers(getUniqueIds(setupIntents, 'customer'))

  return upsertMany('setupIntent', setupIntents)
}
