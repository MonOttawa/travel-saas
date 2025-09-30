import * as z from 'zod';
import type { CreateTravelEstimate, GetTravelEstimates } from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

const travelModeSchema = z.enum(['personal', 'rental']);
const tripRegionSchema = z.enum(['domestic', 'international']);

const totalsSchema = z.object({
  transportation: z.number(),
  meals: z.number(),
  hotel: z.number(),
  extrasPerDiem: z.number(),
  extrasOneTime: z.number(),
  total: z.number(),
});

const summaryRowSchema = z.array(z.object({ label: z.string(), value: z.string() }));

const createTravelEstimateSchema = z.object({
  origin: z.string().trim().optional().nullable(),
  destination: z.string().trim().optional().nullable(),
  startDate: z.string().trim().optional().nullable(),
  returnDate: z.string().trim().optional().nullable(),
  tripRegion: tripRegionSchema,
  travelMode: travelModeSchema,
  distance: z.number().optional().nullable(),
  days: z.number().optional().nullable(),
  includeHotel: z.boolean(),
  includeIncidentals: z.boolean(),
  includeOneTimeExtras: z.boolean(),
  totals: totalsSchema,
  summaryRows: summaryRowSchema,
  metadata: z.record(z.any()).optional().nullable(),
});

type CreateTravelEstimateInput = z.infer<typeof createTravelEstimateSchema>;

export const createTravelEstimate: CreateTravelEstimate<CreateTravelEstimateInput, void> = async (
  rawInput,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401, 'Authentication required to save estimates.');
  }

  const input = ensureArgsSchemaOrThrowHttpError(createTravelEstimateSchema, rawInput);
  const { totals } = input;

  await context.entities.TravelEstimate.create({
    data: {
      userId: context.user.id,
      origin: input.origin ?? null,
      destination: input.destination ?? null,
      startDate: input.startDate ?? null,
      returnDate: input.returnDate ?? null,
      tripRegion: input.tripRegion,
      travelMode: input.travelMode,
      distance: input.distance ?? null,
      days: input.days ?? null,
      includeHotel: input.includeHotel,
      includeIncidentals: input.includeIncidentals,
      includeOneTimeExtras: input.includeOneTimeExtras,
      transportationTotal: totals.transportation,
      mealsTotal: totals.meals,
      hotelTotal: totals.hotel,
      extrasPerDiemTotal: totals.extrasPerDiem,
      extrasOneTimeTotal: totals.extrasOneTime,
      grandTotal: totals.total,
      summary: input.summaryRows,
      payload: input.metadata ?? undefined,
    },
  });
};

export const getTravelEstimates: GetTravelEstimates<void, any> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Authentication required.');
  }

  return context.entities.TravelEstimate.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
};
