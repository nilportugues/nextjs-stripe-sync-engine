import Stripe from 'stripe'
import { backfillCustomers } from './customers'
import { getUniqueIds, upsertMany } from './database_utils'
import { backfillInvoices } from './invoices'

export const upsertPaymentIntents = async (paymentIntents: Stripe.PaymentIntent[]): Promise<Stripe.PaymentIntent[]> => {
  await Promise.all([
    backfillCustomers(getUniqueIds(paymentIntents, 'customer')),
    backfillInvoices(getUniqueIds(paymentIntents, 'invoice')),
  ])

  return upsertMany('paymentIntent', paymentIntents)
}
