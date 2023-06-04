import { PrismaClient } from '@prisma/client';
import prisma from '../prisma/client'

type TableKeys = keyof Omit<PrismaClient, 'disconnect' | 'connect' | 'executeRaw' | 'queryRaw' | 'transaction' | 'on'>
export type Table = TableKeys

export const removeNulls = <T>(entry: T) => {
  
  let newEntry = {...entry} as T

  Object.keys(newEntry as & Record<string, any>).forEach((key) => {
    if ((newEntry as any)[key] === null) {
      (newEntry as any)[key] = undefined;
    }
  });

  return newEntry
}

export const upsertMany = async <T>(
  table: Table,
  entries: T[]
): Promise<T[]> => {

  const upsertPromises = entries.map((entry: T) => {
    const mappedEntry = removeNulls(entry);

    return (prisma[table] as any).upsert({
      where: { id: (mappedEntry as any).id},
      create: mappedEntry,
      update: mappedEntry,
    })
  });

  const results = await Promise.all(upsertPromises);

  return results.flatMap((result) => result) as T[];
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
