import Price from 'stripe'
import { backfillProducts } from './products'
import { getUniqueIds, upsertMany } from './database_utils'
import prisma from '../prisma/client'

const PRISMA_MODEL_NAME = 'price'

export const upsertPrices = async (prices: Price.Price[]): Promise<Price.Price[]> => {
  await backfillProducts(getUniqueIds(prices, 'product'))

  const mapped = prices.map((price) => {
    return {...price, product: { connect: { id: price.product }}}
  })

  const data = (await upsertMany(PRISMA_MODEL_NAME, mapped))
  
  return data as unknown as Price.Price[]
}

export const deletePrice = async (id: string): Promise<boolean> => {
  const deletedPrice = await prisma[PRISMA_MODEL_NAME].delete({
    where: { id },
  });

  return !!deletedPrice;
};
