import { z } from "zod";

export const profilePermissionSelectionSchema = z.object({
  key: z.string().trim().min(1).max(120),
  canView: z.boolean(),
  canEdit: z.boolean(),
}).strict();

const profileFields = {
  name: z.string().trim().min(2, "Informe o nome do perfil.").max(100),
  parentId: z.coerce.number().int().positive().nullable().optional(),
  isCoordinator: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  permissions: z.array(profilePermissionSelectionSchema).max(250).optional(),
};

export const createAccessProfileBodySchema = z.object(profileFields).strict();
export const updateAccessProfileBodySchema = z.object({
  ...profileFields,
  expectedVersion: z.number().int().positive().optional(),
}).strict();
export const accessProfileParamsSchema = z.object({ id: z.coerce.number().int().positive() });
export const listAccessProfilesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  active: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
});
export const listAssignableUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
});
export const assignAccessProfileBodySchema = z.object({ profileId: z.number().int().positive() }).strict();
export const userProfileParamsSchema = z.object({ userCode: z.string().trim().min(1).max(50) });

export type CreateAccessProfileBody = z.infer<typeof createAccessProfileBodySchema>;
export type UpdateAccessProfileBody = z.infer<typeof updateAccessProfileBodySchema>;
