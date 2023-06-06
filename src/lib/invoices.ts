import Invoice from 'stripe'
import { backfillCustomers } from './customers'
import { backfillSubscriptions } from './subscriptions'
import { findMissingEntries, getUniqueIds, upsertMany } from './database_utils'
import Stripe from 'stripe'
import { stripe } from '../utils/StripeClientManager'

const PRISMA_MODEL_NAME = 'invoice'


export const upsertInvoices = async (invoices: Invoice.Invoice[]): Promise<Invoice.Invoice[]> => {

  //Cannot be done in parallel. This is not an error, subscriptions may fail on first run.
  await backfillSubscriptions(getUniqueIds(invoices, 'subscription')).catch(_ => {})
  await backfillCustomers(getUniqueIds(invoices, 'customer'))

  //But those failed will be backfilled here and guarantee consistency.
  await backfillSubscriptions(getUniqueIds(invoices, 'subscription'))
  
  const mappedInvoices = invoices.map((invoice) => {
    return {
      ...invoice,
      customer: {
        connect: {
          id: invoice.customer,
        },
      },
     
      subscription: {
        connect: {
          id: invoice.subscription,
        },
      }
    }
  })

  return upsertMany(PRISMA_MODEL_NAME, mappedInvoices as any)
}

export const backfillInvoices = async (invoiceIds: string[]) => {
  const missingInvoiceIds = await findMissingEntries(PRISMA_MODEL_NAME, invoiceIds)
  await fetchAndInsertInvoices(missingInvoiceIds)
}

const fetchAndInsertInvoices = async (invoiceIds: string[]) => {
  if (!invoiceIds.length) return

  const invoices: Stripe.Invoice[] = []

  for (const invoiceId of invoiceIds) {
    const invoice = await stripe.invoices.retrieve(invoiceId)
    invoices.push(invoice)
  }

  await upsertInvoices(invoices)
}
