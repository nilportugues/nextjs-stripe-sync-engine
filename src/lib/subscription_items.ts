import Subscription from 'stripe'
import { removeNulls, upsertMany } from './database_utils'
import prisma from '../prisma/client'

const PRISMA_MODEL_NAME = 'subscriptionItem'


export const upsertSubscriptionItems = async (subscriptionItems: Subscription.SubscriptionItem[]) => {
  const modifiedSubscriptionItems = subscriptionItems.map((subscriptionItem) => {
    // Modify price object to string id; reference prices table
    const priceId = subscriptionItem.price.id.toString()
    // deleted exists only on a deleted item
    const deleted = subscriptionItem.deleted
    // quantity not exist on volume tier item
    const quantity = subscriptionItem.quantity
    return {
      ...removeNulls(subscriptionItem),
      price: priceId,
      deleted: deleted ?? false,
      quantity: quantity ?? null,
    }
  })

  await upsertMany(PRISMA_MODEL_NAME, modifiedSubscriptionItems)
}


export const markDeletedSubscriptionItems = async (
  subscriptionId: string,
  currentSubItemIds: string[]
): Promise<{ rowCount: number }> => {
  const existingItems = await prisma[PRISMA_MODEL_NAME].findMany({
    where: {
      subscription: {
        id: subscriptionId
      },
      deleted: false,
    },
    select: {
      id: true,
    },
  });

  const deletedIds = existingItems
    .filter(({ id }) => !currentSubItemIds.includes(id))
    .map(({ id }) => id);

  if (deletedIds.length > 0) {
    await prisma[PRISMA_MODEL_NAME].updateMany({
      where: {
        id: {
          in: deletedIds,
        },
      },
      data: {
        deleted: true,
      },
    });

    return { rowCount: deletedIds.length };
  } else {
    return { rowCount: 0 };
  }
};

