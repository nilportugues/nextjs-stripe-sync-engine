import Product from 'stripe'
import { stripe } from '../utils/StripeClientManager'
import { findMissingEntries, upsertMany } from './database_utils'
import Stripe from 'stripe'
import prisma from '../prisma/client'

const PRISMA_MODEL_NAME = 'product'

export const upsertProducts = async (products: Product.Product[]): Promise<Product.Product[]> => {

  return upsertMany(PRISMA_MODEL_NAME, products)
}
export const deleteProduct = async (id: string): Promise<boolean> => {
  const deletedProduct = await prisma[PRISMA_MODEL_NAME].delete({
    where: { id },
    select: { id: true },
  });

  return deletedProduct !== null;
};

export const backfillProducts = async (productids: string[]) => {
  const missingProductIds = await findMissingEntries(PRISMA_MODEL_NAME, productids)
  await fetchAndInsertProducts(missingProductIds)
}

const fetchAndInsertProducts = async (productIds: string[]) => {
  if (!productIds.length) return

  const products: Stripe.Product[] = []

  for (const productId of productIds) {
    const product = await stripe.products.retrieve(productId)
    products.push(product)
  }

  await upsertProducts(products)
}
