import Stripe from 'stripe'
import { backfillProducts } from './products'
import { findMissingEntries, getUniqueIds, upsertMany } from './database_utils'
import prisma from '../prisma/client'
import { stripe } from '../utils/StripeClientManager'

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
  })

  return deletedPlan !== null
}

export const backfillPlans = async (planIds: string[]) => {
  const missingPlanIds = await findMissingEntries(PRISMA_MODEL_NAME, planIds)
  await fetchAndInsertPlans(missingPlanIds)
}

export const fetchAndInsertPlans = async (planIds: string[]) => {
  if (!planIds.length) return

  const plans: Stripe.Plan[] = []

  for (const planId of planIds) {
    const p = await stripe.plans.retrieve(planId)
    plans.push(p as Stripe.Plan)
  }

  await upsertPlans(plans)
}
