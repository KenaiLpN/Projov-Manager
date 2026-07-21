import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ChamadoCreateBody,
  ChamadoListQuery,
  ChamadoMensagemBody,
  ChamadoNotificationQuery,
  ChamadoResolucaoBody,
  ChamadoUpdateBody,
  ChamadoUrgenciaBody,
  chamadoCreateBodySchema,
  chamadoListQuerySchema,
  chamadoMensagemBodySchema,
  chamadoNotificationQuerySchema,
  chamadoParamsSchema,
  chamadoResolucaoBodySchema,
  chamadoUpdateBodySchema,
  chamadoUrgenciaBodySchema,
} from "../schemas/chamadoSchema";
import {
  ChamadoService,
  ChamadoServiceError,
  ChamadoUser,
} from "../services/ChamadoService";

const service = new ChamadoService();

function authenticatedUser(request: FastifyRequest): ChamadoUser {
  const user = request.user as ChamadoUser;
  return {
    sub: String(user.sub),
    nome: user.nome,
    role: user.role,
  };
}

function ticketId(params: unknown) {
  return BigInt((params as { id: string }).id);
}

function handleError(error: unknown, reply: FastifyReply, fallback: string) {
  if (error instanceof ChamadoServiceError) {
    return reply.status(error.statusCode).send({ message: error.message });
  }

  console.error(fallback, error);
  return reply.status(500).send({ message: fallback });
}

export async function chamadoRoutes(app: FastifyInstance) {
  const routes = app.withTypeProvider<ZodTypeProvider>();

  routes.get(
    "/chamados",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Chamados"],
        summary: "Lista os chamados visíveis para o usuário autenticado",
        querystring: chamadoListQuerySchema,
      },
    },
    async (request, reply) => {
      try {
        const { search, patrimonio } = request.query as ChamadoListQuery;
        const data = await service.list(
          authenticatedUser(request),
          search,
          patrimonio,
        );
        return reply.status(200).send({ data });
      } catch (error) {
        return handleError(error, reply, "Erro ao listar chamados.");
      }
    },
  );

  routes.post(
    "/chamados",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Chamados"],
        summary: "Abre um chamado para o usuário autenticado",
        body: chamadoCreateBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const data = await service.create(
          authenticatedUser(request),
          request.body as ChamadoCreateBody,
        );
        return reply.status(201).send({ data });
      } catch (error) {
        return handleError(error, reply, "Erro ao abrir chamado.");
      }
    },
  );

  routes.get(
    "/chamados/notificacoes",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Chamados"],
        summary: "Lista novos eventos de chamados para notificações",
        querystring: chamadoNotificationQuerySchema,
      },
    },
    async (request, reply) => {
      try {
        const { after } = request.query as ChamadoNotificationQuery;
        const data = await service.notifications(
          authenticatedUser(request),
          after ? BigInt(after) : undefined,
        );
        return reply.status(200).send(data);
      } catch (error) {
        return handleError(error, reply, "Erro ao carregar notificações.");
      }
    },
  );

  routes.get(
    "/chamados/:id/conversa",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Chamados"],
        summary: "Lista a conversa pública de um chamado",
        params: chamadoParamsSchema,
      },
    },
    async (request, reply) => {
      try {
        const data = await service.conversation(
          authenticatedUser(request),
          ticketId(request.params),
        );
        return reply.status(200).send({ data });
      } catch (error) {
        return handleError(error, reply, "Erro ao carregar a conversa.");
      }
    },
  );

  routes.post(
    "/chamados/:id/mensagens",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Chamados"],
        summary: "Envia uma mensagem pública na conversa do chamado",
        params: chamadoParamsSchema,
        body: chamadoMensagemBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const data = await service.sendMessage(
          authenticatedUser(request),
          ticketId(request.params),
          request.body as ChamadoMensagemBody,
        );
        return reply.status(201).send({ data });
      } catch (error) {
        return handleError(error, reply, "Erro ao enviar a mensagem.");
      }
    },
  );

  routes.post(
    "/chamados/:id/confirmar-solucao",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Chamados"],
        summary: "Confirma a solução proposta para um chamado",
        params: chamadoParamsSchema,
      },
    },
    async (request, reply) => {
      try {
        const data = await service.confirmSolution(
          authenticatedUser(request),
          ticketId(request.params),
        );
        return reply.status(200).send({ data });
      } catch (error) {
        return handleError(error, reply, "Erro ao confirmar a solução.");
      }
    },
  );

  routes.patch(
    "/chamados/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Chamados"],
        summary: "Edita os dados de um chamado",
        params: chamadoParamsSchema,
        body: chamadoUpdateBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const data = await service.update(
          authenticatedUser(request),
          ticketId(request.params),
          request.body as ChamadoUpdateBody,
        );
        return reply.status(200).send({ data });
      } catch (error) {
        return handleError(error, reply, "Erro ao editar chamado.");
      }
    },
  );

  routes.patch(
    "/chamados/:id/urgencia",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Chamados"],
        summary: "Classifica a urgência de um chamado",
        params: chamadoParamsSchema,
        body: chamadoUrgenciaBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const data = await service.updateUrgency(
          authenticatedUser(request),
          ticketId(request.params),
          request.body as ChamadoUrgenciaBody,
        );
        return reply.status(200).send({ data });
      } catch (error) {
        return handleError(error, reply, "Erro ao classificar chamado.");
      }
    },
  );

  routes.post(
    "/chamados/:id/resolver",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Chamados"],
        summary: "Registra a resolução de um chamado",
        params: chamadoParamsSchema,
        body: chamadoResolucaoBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const data = await service.resolve(
          authenticatedUser(request),
          ticketId(request.params),
          request.body as ChamadoResolucaoBody,
        );
        return reply.status(200).send({ data });
      } catch (error) {
        return handleError(error, reply, "Erro ao resolver chamado.");
      }
    },
  );
}
