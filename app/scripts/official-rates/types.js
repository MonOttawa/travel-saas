import { createHash } from 'crypto';
import { z } from 'zod';

export const TableHeaderSchema = z.object({
  label: z.string(),
  key: z.string(),
});

const TableValueSchema = z.union([z.string(), z.number(), z.null()]);

export const TableDataSchema = z.object({
  source: z.string().url(),
  fetchedAt: z.string(),
  hash: z.string().length(64),
  headers: z.array(TableHeaderSchema),
  rows: z.array(z.record(TableValueSchema)),
  metadata: z
    .object({
      description: z.string().optional(),
      effectiveDate: z.string().optional(),
      notes: z.array(z.string()).optional(),
      context: z.record(z.any()).optional(),
    })
    .optional(),
});

export const ScrapeResultSchema = z.object({
  id: z.string(),
  data: TableDataSchema,
});

export const ScrapeManifestSchema = z.object({
  generatedAt: z.string(),
  sources: z.array(
    z.object({
      id: z.string(),
      hash: z.string(),
      recordCount: z.number().nonnegative(),
      source: z.string().url(),
      effectiveDate: z.string().optional(),
    }),
  ),
});

export const buildTableData = ({
  source,
  headers,
  rows,
  metadata,
}) => {
  const payload = {
    source,
    fetchedAt: new Date().toISOString(),
    headers,
    rows,
    metadata,
  };

  const hash = createHash('sha256').update(JSON.stringify({ headers, rows })).digest('hex');
  payload.hash = hash;

  return TableDataSchema.parse(payload);
};
