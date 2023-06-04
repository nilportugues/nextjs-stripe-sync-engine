import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Upserts a record using Prisma ORM methods.
 * @param schema The schema name
 * @param table The table name
 * @param record The record to upsert
 * @param options Additional options (e.g., conflict field)
 * @returns The upserted record
 */
export const upsertRecord = async (
  schema: string,
  table: string,
  record: Record<string, unknown>,
  options?: {
    conflict?: string;
  }
): Promise<Record<string, unknown>> => {
  const { conflict = 'id' } = options || {};

  const upsertedRecord = await prisma[schema][table].upsert({
    where: { [conflict]: record[conflict] },
    update: record,
    create: record,
  });

  return upsertedRecord;
};


/**
 * For array object field like invoice.custom_fields
 * ex: [{"name":"Project name","value":"Test Project"}]
 *
 * we need to stringify it first cos passing array object directly will end up with
 * {
 * invalid input syntax for type json
 * detail: 'Expected ":", but found "}".',
 * where: 'JSON data, line 1: ...\\":\\"Project name\\",\\"value\\":\\"Test Project\\"}"}',
 * }
 */

export const cleanseArrayField = (obj: {
  [Key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}): {
  [Key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
} => {
  const cleansed = { ...obj }
  Object.keys(cleansed).map((k) => {
    const data = cleansed[k]
    if (Array.isArray(data)) {
      cleansed[k] = JSON.stringify(data)
    }
  })
  return cleansed
}
