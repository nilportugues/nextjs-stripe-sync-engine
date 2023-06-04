import Stripe from 'stripe'
import { backfillCustomers } from './customers'
import { getUniqueIds, upsertMany } from './database_utils'


const PRISMA_MODEL_NAME = 'paymentMethod'

export const upsertPaymentMethods = async (paymentMethods: Stripe.PaymentMethod[]): Promise<Stripe.PaymentMethod[]> => {
  await backfillCustomers(getUniqueIds(paymentMethods, 'customer'))

  return upsertMany(PRISMA_MODEL_NAME, paymentMethods)
}
