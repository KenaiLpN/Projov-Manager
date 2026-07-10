import { z } from "zod";

export const participantesResponseSchema = z.object({
  QtdeAprendiz: z.coerce.number(),
  StatusAprendiz: z.string(),
});

export const listParticipantesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
  search: z.string().optional(),
});

export type ListParticipantesQuery = z.infer<typeof listParticipantesQuerySchema>;
export const listParticipantesResponseSchema = z.object({
  data: z.array(participantesResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
