import Price from 'stripe'
import { backfillProducts } from './products'
import { getUniqueIds, upsertMany } from './database_utils'
import prisma from '../prisma/client'

const PRISMA_MODEL_NAME = 'price'

export const upsertPrices = async (prices: Price.Price[]): Promise<Price.Price[]> => {
  await backfillProducts(getUniqueIds(prices, 'product'))

  return upsertMany(PRISMA_MODEL_NAME, prices)
}

export const deletePrice = async (id: string): Promise<boolean> => {
  const deletedPrice = await prisma[PRISMA_MODEL_NAME].delete({
    where: { id },
  });

  return !!deletedPrice;
};
