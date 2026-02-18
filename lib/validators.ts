import { z } from "zod";

export const sessionSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  title: z.string().nullable(),
  summary: z.string().nullable(),
  status: z.enum(["pending", "streaming", "completed", "error"]),
  error: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const sessionsListSchema = z.array(sessionSchema);

export const apiErrorSchema = z.object({
  error: z.string(),
});

export type ValidatedSession = z.infer<typeof sessionSchema>;
