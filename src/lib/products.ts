import Product from 'stripe'
import { stripe } from '../utils/StripeClientManager'
import { findMissingEntries, upsertMany } from './database_utils'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const upsertProducts = async (products: Product.Product[]): Promise<Product.Product[]> => {
  return upsertMany('product', products)
}
export const deleteProduct = async (id: string): Promise<boolean> => {
  const deletedProduct = await prisma.product.delete({
    where: { id },
    select: { id: true },
  });

  return deletedProduct !== null;
};

export const backfillProducts = async (productids: string[]) => {
  const missingProductIds = await findMissingEntries('product', productids)
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
