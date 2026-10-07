import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authorizePermission } from "../lib/authorization";
import { AccessControlService } from "../services/AccessControlService";
import {
  accessProfileParamsSchema,
  assignAccessProfileBodySchema,
  createAccessProfileBodySchema,
  listAssignableUsersQuerySchema,
  listAccessProfilesQuerySchema,
  updateAccessProfileBodySchema,
  userProfileParamsSchema,
} from "../schemas/accessProfileSchema";

const service = new AccessControlService();
const manageProfiles = authorizePermission("acessos.perfis", "edit");
const viewProfiles = authorizePermission("acessos.perfis", "view");
const manageAssignments = authorizePermission("acessos.designacoes", "edit");

function actor(request: { user?: { sub?: string } }) {
  return String(request.user?.sub ?? "unknown");
}

export async function accessProfileRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get("/permissions/catalog", { preHandler: [viewProfiles] }, async () => ({ data: service.getCatalog() }));

  typed.get("/access-profiles", {
    preHandler: [viewProfiles],
    schema: { querystring: listAccessProfilesQuerySchema },
  }, async (request) => {
    const { page, limit, search, active } = request.query;
    return service.listProfiles(page, limit, search, active);
  });

  typed.get("/assignable-access-profiles", {
    preHandler: [authorizePermission("acessos.designacoes", "view")],
  }, async () => ({ data: await service.listAssignableProfiles() }));

  typed.get("/access-profile-users", {
    preHandler: [authorizePermission("acessos.designacoes", "view")],
    schema: { querystring: listAssignableUsersQuerySchema },
  }, async (request) => service.listAssignableUsers(request.query.page, request.query.limit, request.query.search));

  typed.get("/access-profiles/:id", {
    preHandler: [viewProfiles],
    schema: { params: accessProfileParamsSchema },
  }, async (request, reply) => {
    const profile = await service.getProfile(request.params.id);
    if (!profile) return reply.status(404).send({ message: "Perfil não encontrado." });
    return profile;
  });

  typed.post("/access-profiles", {
    preHandler: [manageProfiles],
    schema: { body: createAccessProfileBodySchema },
  }, async (request, reply) => reply.status(201).send(await service.createProfile(request.body, actor(request))));

  typed.patch("/access-profiles/:id", {
    preHandler: [manageProfiles],
    schema: { params: accessProfileParamsSchema, body: updateAccessProfileBodySchema },
  }, async (request) => service.updateProfile(request.params.id, request.body, actor(request)));

  typed.delete("/access-profiles/:id", {
    preHandler: [manageProfiles],
    schema: { params: accessProfileParamsSchema },
  }, async (request) => service.deactivateProfile(request.params.id, actor(request)));

  typed.get("/users/:userCode/profile", {
    preHandler: [authorizePermission("acessos.designacoes", "view")],
    schema: { params: userProfileParamsSchema },
  }, async (request) => ({ data: await service.getUserProfile(request.params.userCode) }));

  typed.put("/users/:userCode/profile", {
    preHandler: [manageAssignments],
    schema: { params: userProfileParamsSchema, body: assignAccessProfileBodySchema },
  }, async (request) => ({ data: await service.assignProfile(request.params.userCode, request.body.profileId, actor(request)) }));

  typed.get("/auth/me/permissions", async (request, reply) => {
    const user = request.user as { sub?: string; role?: string } | undefined;
    if (!user?.sub) return reply.status(401).send({ message: "Não autorizado." });
    const access = await service.resolveUserAccess(String(user.sub), user.role);
    return { data: access };
  });
}
