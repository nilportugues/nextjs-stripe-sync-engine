import { getConfig } from '../utils/config'
import Stripe from 'stripe'
import { backfillCustomers } from './customers'
import { getUniqueIds, upsertMany } from './database_utils'

const config = getConfig()

export const upsertPaymentMethods = async (paymentMethods: Stripe.PaymentMethod[]): Promise<Stripe.PaymentMethod[]> => {
  await backfillCustomers(getUniqueIds(paymentMethods, 'customer'))

  return upsertMany('paymentMethod', paymentMethods)
}
