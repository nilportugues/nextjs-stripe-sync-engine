import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

type TableKeys = keyof Omit<PrismaClient, 'disconnect' | 'connect' | 'executeRaw' | 'queryRaw' | 'transaction' | 'on'>
type Table = TableKeys


export const upsertMany = async <T>(
  table: Table,
  entries: T[]
): Promise<T[]> => {

  const upsertPromises = entries.map((entry: any) =>
    (prisma[table] as any).upsert({
      where: { id: entry.id },
      create: entry,
      update: entry,
    })
  );

  const results = await Promise.all(upsertPromises);

  return results.flatMap((result) => result);
};

export const findMissingEntries = async (table: Table, ids: string[]): Promise<string[]> => {
  if (!ids.length) return [];
 
  const existingIds = await (prisma[table] as any)!.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
    },
  });

  const existingIdSet = new Set(existingIds.map((it: any) => it.id));
  const missingIds = ids.filter((it) => !existingIdSet.has(it));

  return missingIds;
};

export const getUniqueIds = <T>(entries: T[], key: keyof T): string[] => {
  const set = new Set(
    entries
      .map((entry) => entry?.[key]?.toString())
      .filter((it): it is string => Boolean(it))
  );

  return Array.from(set);
};
