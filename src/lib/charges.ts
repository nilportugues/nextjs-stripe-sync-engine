import Stripe from 'stripe'
import { backfillInvoices } from './invoices'
import { backfillCustomers } from './customers'
import { findMissingEntries, getUniqueIds, upsertMany } from './database_utils'
import { stripe } from '../utils/StripeClientManager'

const PRISMA_MODEL_NAME = 'charge'

export const upsertCharges = async (charges: Stripe.Charge[]): Promise<Stripe.Charge[]> => {
  await Promise.all([
    backfillCustomers(getUniqueIds(charges, 'customer')),
    backfillInvoices(getUniqueIds(charges, 'invoice')),
  ])

  return upsertMany(PRISMA_MODEL_NAME, charges)
}

export const backfillCharges = async (chargeIds: string[]) => {
  const missingChargeIds = await findMissingEntries(PRISMA_MODEL_NAME, chargeIds)
  await fetchAndInsertCharges(missingChargeIds)
}

const fetchAndInsertCharges = async (chargeIds: string[]) => {
  if (!chargeIds.length) return

  const charges: Stripe.Charge[] = []

  for (const chargeId of chargeIds) {
    const charge = await stripe.charges.retrieve(chargeId)
    charges.push(charge)
  }

  await upsertCharges(charges)
}
