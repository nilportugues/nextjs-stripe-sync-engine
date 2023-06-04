import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Executes a query using Prisma ORM.
 * @param text The query text
 * @param params Optional parameters for the query
 * @returns The query result
 */
export const query = async (text: string, params?: string[]): Promise<any> => {
  const result = await prisma.$queryRaw(text, params);
  return result;
};
