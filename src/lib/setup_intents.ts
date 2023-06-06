import Stripe from 'stripe'
import { backfillCustomers } from './customers'
import { getUniqueIds, upsertMany } from './database_utils'

const PRISMA_MODEL_NAME = 'setupIntent'

export const upsertSetupIntents = async (setupIntents: Stripe.SetupIntent[]): Promise<Stripe.SetupIntent[]> => {
  await backfillCustomers(getUniqueIds(setupIntents, 'customer'))

  const upsertPromises = setupIntents.map((setupIntent) => {
    
    //Remove fields that have secrets in them
    const {client_secret,next_action, ...data} = setupIntent;

    return {
      ...data,
      client_secret: null,
      next_action: null,
    }
  })

  return upsertMany(PRISMA_MODEL_NAME, upsertPromises)
}
