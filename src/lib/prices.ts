import Price, { Stripe } from 'stripe'
import { backfillProducts } from './products'
import { findMissingEntries, getUniqueIds, upsertMany } from './database_utils'
import prisma from '../prisma/client'
import { stripe } from '../utils/StripeClientManager'

const PRISMA_MODEL_NAME = 'price'

export const upsertPrices = async (prices: Price.Price[]): Promise<Price.Price[]> => {
  await backfillProducts(getUniqueIds(prices, 'product'))

  const mapped = prices.map((price) => {
    return { ...price, product: { connect: { id: price.product } } }
  })

  const data = await upsertMany(PRISMA_MODEL_NAME, mapped)

  return data as unknown as Price.Price[]
}

export const deletePrice = async (id: string): Promise<boolean> => {
  const deletedPrice = await prisma[PRISMA_MODEL_NAME].delete({
    where: { id },
  })

  return !!deletedPrice
}

export const backfillPrices = async (priceIds: string[]) => {
  const missingPriceIds = await findMissingEntries(PRISMA_MODEL_NAME, priceIds)
  await fetchAndInsertPrices(missingPriceIds)
}

export const fetchAndInsertPrices = async (priceIds: string[]) => {
  if (!priceIds.length) return

  const prices: Stripe.Price[] = []

  for (const priceId of priceIds) {
    const price = await stripe.prices.retrieve(priceId)
    prices.push(price as Stripe.Price)
  }

  await upsertPrices(prices)
}
