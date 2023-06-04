import Stripe from 'stripe'
import { backfillProducts } from './products'
import { getUniqueIds, upsertMany } from './database_utils'
import prisma from '../prisma/client'

const PRISMA_MODEL_NAME = 'plan'

export const upsertPlans = async (plans: Stripe.Plan[]): Promise<Stripe.Plan[]> => {
  await backfillProducts(getUniqueIds(plans, 'product'))

  return upsertMany(PRISMA_MODEL_NAME, plans)
}

export const deletePlan = async (id: string): Promise<boolean> => {
  const deletedPlan = await prisma[PRISMA_MODEL_NAME].delete({
    where: {
      id: id,
    },
    select: {
      id: true,
    },
  });

  return deletedPlan !== null;
};
