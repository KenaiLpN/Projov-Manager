import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { CA_AprendizService } from "../services/CA_AprendizService";

import {
  caAprendizSchema,
  CaAprendizInput,
  listCaAprendizQuerySchema,
  ListCaAprendizQuery,
  updateOwnAprendizSchema,
} from "../schemas/CA_AprendizSchema";

const service = new CA_AprendizService();

type AuthenticatedUser = {
  sub: string;
  role?: string;
  tokenTipo?: string;
  tipoAcesso?: string;
};

function isAprendizUser(user?: AuthenticatedUser) {
  return (
    user?.role === "APRENDIZ" ||
    user?.tokenTipo === "APRENDIZ" ||
    user?.tipoAcesso === "APRENDIZ"
  );
}

function isOwnAprendizRecord(id: number, user?: AuthenticatedUser) {
  return String(id) === String(user?.sub ?? "");
}

export async function caAprendizRoutes(app: FastifyInstance) {
  // GET /ca-aprendiz — lista paginada
  app.withTypeProvider<ZodTypeProvider>().get(
    "/ca-aprendiz",
    {
      schema: {
        tags: ["CA_Aprendiz"],
        summary: "Lista aprendizes (CA_Aprendiz) com paginação",
        querystring: listCaAprendizQuerySchema,
      },
    },
    async (request, reply: FastifyReply) => {
      if (isAprendizUser(request.user as AuthenticatedUser)) {
        return reply.status(403).send({ message: "Acesso nao permitido." });
      }
      const { page, limit, search, filter, advancedFilter } =
        request.query as ListCaAprendizQuery & { filter?: string; advancedFilter?: string };
      try {
        const result = await service.getAll(page, limit, search, filter, advancedFilter);
        return reply.status(200).send(result);
      } catch {
        return reply.status(500).send({ message: "Erro ao listar aprendizes." });
      }
    },
  );

  // GET /ca-aprendiz/stats — totais
  app.withTypeProvider<ZodTypeProvider>().get(
    "/ca-aprendiz/stats",
    {
      schema: {
        tags: ["CA_Aprendiz"],
        summary: "Estatísticas dos aprendizes",
        response: {
          200: z.object({
            alunos:     z.coerce.number(),
            inscritos:  z.coerce.number(),
            habilitados:   z.coerce.number(),
            desligados: z.coerce.number(),
            aprendizagem: z.coerce.number(),
            inscritosinternet: z.coerce.number(),
            aprovados: z.coerce.number(),
            naohabilitados: z.coerce.number(),
          }),
        },
      },
    },
    async (_request, reply: FastifyReply) => {
      if (isAprendizUser(_request.user as AuthenticatedUser)) {
        return reply.status(403).send({ message: "Acesso nao permitido." });
      }
      try {
        const stats = await service.getStats();
        return reply.status(200).send(stats);
      } catch {
        return reply.status(500).send({ message: "Erro ao buscar estatísticas." });
      }
    },
  );

  // GET /ca-aprendiz/:id — por código
  app.withTypeProvider<ZodTypeProvider>().get(
    "/ca-aprendiz/:id",
    {
      schema: {
        tags: ["CA_Aprendiz"],
        summary: "Busca aprendiz pelo código",
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const user = request.user as AuthenticatedUser;
      if (isAprendizUser(user) && !isOwnAprendizRecord(id, user)) {
        return reply.status(403).send({ message: "Acesso nao permitido." });
      }
      try {
        const record = await service.getById(id);
        if (!record) return reply.status(404).send({ message: "Aprendiz não encontrado." });
        return reply.status(200).send(record);
      } catch {
        return reply.status(500).send({ message: "Erro ao buscar aprendiz." });
      }
    },
  );

  // POST /ca-aprendiz — criar
  app.withTypeProvider<ZodTypeProvider>().post(
    "/ca-aprendiz",
    {
      schema: {
        tags: ["CA_Aprendiz"],
        summary: "Cria novo aprendiz",
        body: caAprendizSchema,
      },
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as CaAprendizInput;
      const user = request.user as AuthenticatedUser;
      if (isAprendizUser(user)) {
        return reply.status(403).send({ message: "Acesso nao permitido." });
      }
      try {
        const created = await service.create(body, user.sub);
        return reply.status(201).send(created);
      } catch (error: any) {
        const msg = error?.message ?? "Erro ao criar aprendiz.";
        return reply.status(500).send({ message: msg });
      }
    },
  );

  // PUT /ca-aprendiz/:id — atualizar
  app.withTypeProvider<ZodTypeProvider>().put(
    "/ca-aprendiz/:id",
    {
      schema: {
        tags: ["CA_Aprendiz"],
        summary: "Atualiza aprendiz",
        params: z.object({ id: z.coerce.number() }),
        body: caAprendizSchema.partial(),
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const user = request.user as AuthenticatedUser;
      let body = request.body as Partial<CaAprendizInput>;

      if (isAprendizUser(user)) {
        if (!isOwnAprendizRecord(id, user)) {
          return reply.status(403).send({ message: "Acesso nao permitido." });
        }

        const parsed = updateOwnAprendizSchema.safeParse(request.body);
        if (!parsed.success) {
          return reply.status(400).send({
            message: "Dados invalidos para atualizacao do proprio cadastro.",
            errors: parsed.error.issues,
          });
        }
        body = parsed.data as Partial<CaAprendizInput>;
      }

      try {
        const updated = await service.update(id, body, user.sub);
        return reply.status(200).send(updated);
      } catch (error: any) {
        const msg = error?.message ?? "Erro ao atualizar aprendiz.";
        return reply.status(500).send({ message: msg });
      }
    },
  );

  // DELETE /ca-aprendiz/:id — deletar
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/ca-aprendiz/:id",
    {
      schema: {
        tags: ["CA_Aprendiz"],
        summary: "Remove aprendiz",
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      if (isAprendizUser(request.user as AuthenticatedUser)) {
        return reply.status(403).send({ message: "Acesso nao permitido." });
      }
      try {
        await service.delete(id);
        return reply.status(204).send();
      } catch {
        return reply.status(500).send({ message: "Erro ao deletar aprendiz." });
      }
    },
  );
}
