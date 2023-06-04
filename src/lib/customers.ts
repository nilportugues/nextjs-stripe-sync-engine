import { stripe } from '../utils/StripeClientManager'
import Stripe from 'stripe'
import { findMissingEntries } from './database_utils'
import prisma from '../prisma/client'

const PRISMA_MODEL_NAME = 'customer'


export const upsertCustomers = async (customers: Stripe.Customer[]) => {

  const upsertPromises = customers.map(async (customer) => {

    //remove fields
    const { sources, tax_ids, subscriptions, ...keepData} = customer

    //fields to format as JSON
    const { address, metadata, shipping, discount, invoice_settings, preferred_locales, default_source, deleted, ...data} = keepData

    const record = {
      ...data,
      address: address ? JSON.stringify(address) : undefined,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      shipping: shipping ? JSON.stringify(shipping) : undefined,
      discount: discount ? JSON.stringify(discount) : undefined,
      invoice_settings: invoice_settings ? JSON.stringify(invoice_settings) : undefined,
      preferred_locales: preferred_locales ? JSON.stringify(preferred_locales) : undefined,
      default_source: default_source ? JSON.stringify(default_source) : undefined,
      deleted: !!deleted,
    }

    if (customer.deleted) {
      return prisma[PRISMA_MODEL_NAME].upsert({
        where: { id: customer.id },
        create: record,
        update: record,
      });
    } else {
      return prisma[PRISMA_MODEL_NAME].upsert({
        where: { id: customer.id },
        create: record,
        update: record,
      });
    }
  });

  const results = await Promise.all(upsertPromises);

  return results.flatMap((result) => result) as unknown as Stripe.Customer[]
};

export const backfillCustomers = async (customerIds: string[]) => {
  const missingCustomerIds = await findMissingEntries(PRISMA_MODEL_NAME, customerIds)
  await fetchAndInsertCustomers(missingCustomerIds)
}

export const fetchAndInsertCustomers = async (customerIds: string[]) => {
  if (!customerIds.length) return

  const customers: Stripe.Customer[] = []

  for (const customerId of customerIds) {
    const customer = await stripe.customers.retrieve(customerId)
    customers.push(customer as Stripe.Customer)
  }

  await upsertCustomers(customers)
}
