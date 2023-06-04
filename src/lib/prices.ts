import Price from 'stripe'
import { backfillProducts } from './products'
import { getUniqueIds, upsertMany } from './database_utils'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const upsertPrices = async (prices: Price.Price[]): Promise<Price.Price[]> => {
  await backfillProducts(getUniqueIds(prices, 'product'))

  return upsertMany('price', prices)
}

export const deletePrice = async (id: string): Promise<boolean> => {
  const deletedPrice = await prisma.price.delete({
    where: { id },
  });

  return !!deletedPrice;
};
