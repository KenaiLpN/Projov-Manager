import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { UserService } from "../services/UserService";
import { hash } from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authorizeRoles } from "../lib/authorization";
import {
  createUserBodySchema,
  userResponseSchema,
  listUsersResponseSchema,
  CreateUserBody,
  listUsersQuerySchema,
  ListUsersQuery,
  updateUserParamsSchema,
  updateUserBodySchema,
  UpdateUserParams,
  UpdateUserBody,
  deleteUserParamsSchema,
  DeleteUserParams,
} from "../schemas/userSchema";
import { z } from "zod";
const userService = new UserService();
const onlyAdminOrDev = authorizeRoles(["A", "DEV"]);

export async function userRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        tags: ["Usuários"],
        summary: "Cria um novo usuário (cliente) no sistema",
        body: createUserBodySchema,
        response: {
          201: userResponseSchema,
          409: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
      preHandler: [onlyAdminOrDev],
    },
    async (request, reply: FastifyReply) => {
      const { UsuCodigo, UsuNome, UsuEmail, UsuTipo, UsuSenha } =
        request.body as CreateUserBody;
      try {
        const passwordHashed = await hash(UsuSenha, 10);
        const newUser = await userService.createUser({
          UsuCodigo,
          UsuNome,
          UsuEmail,
          UsuTipo,
          UsuSenha: passwordHashed,
        });
        return reply.status(201).send(newUser);
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            return reply.status(409).send({
              message: "Este e-mail ou Código já está cadastrado no sistema.",
            });
          }
        }
        if (error instanceof Error) {
          console.error("Erro ao criar usuário:", error.message);
          return reply
            .status(500)
            .send({ message: "Erro interno ao processar a requisição." });
        }
        return reply
          .status(500)
          .send({ message: "Um erro desconhecido ocorreu." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users",
    {
      schema: {
        tags: ["Usuários"],
        summary: "Lista usuários com paginação",
        querystring: listUsersQuerySchema,
        response: {
          200: listUsersResponseSchema,
          500: z.object({ message: z.string() }),
        },
      },
      preHandler: [onlyAdminOrDev],
    },
    async (request, reply: FastifyReply) => {
      const { page, limit, search } = request.query as ListUsersQuery;
      try {
        const result = await userService.getAllUsers(page, limit, search);
        return reply.status(200).send(result);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply.status(500).send({ message: "Erro interno." });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users/me",
    {
      schema: {
        tags: ["Usuarios"],
        summary: "Retorna os dados do usuario logado",
        response: {
          200: userResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const userCode = request.user?.sub;

      if (!userCode) {
        return reply.status(404).send({ message: "Usuario nao encontrado." });
      }

      try {
        const user = await userService.getPublicUserByCode(String(userCode));

        if (!user) {
          return reply.status(404).send({ message: "Usuario nao encontrado." });
        }

        return reply.status(200).send(user);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply.status(500).send({ message: "Erro interno." });
        }

        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().put(
    "/users/:id",
    {
      schema: {
        tags: ["Usuários"],
        summary: "Atualiza dados de um usuário existente",
        params: updateUserParamsSchema,
        body: updateUserBodySchema,
        response: {
          200: userResponseSchema,
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
      preHandler: [onlyAdminOrDev],
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as UpdateUserParams;
      const updateData = request.body as UpdateUserBody;
      try {
        if (Object.keys(updateData).length === 0) {
          return reply
            .status(400)
            .send({ message: "Nenhum dado enviado para atualização." });
        }
        if (updateData.UsuSenha) {
          updateData.UsuSenha = await hash(updateData.UsuSenha, 10);
        }
        const updatedUser = await userService.updateUser(
          id,
          updateData as any,
        );
        if (!updatedUser) {
          return reply.status(404).send({ message: "Usuário não encontrado." });
        }
        return reply.status(200).send(updatedUser);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply
            .status(500)
            .send({ message: "Erro interno ao atualizar usuário." });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/users/:id",
    {
      schema: {
        tags: ["Usuários"],
        summary: "Exclui um usuário do sistema",
        params: deleteUserParamsSchema,
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
      preHandler: [onlyAdminOrDev],
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as DeleteUserParams;
      try {
        const deleted = await userService.deleteUser(id);
        if (deleted === null) {
          return reply.status(404).send({ message: "Usuário não encontrado." });
        }
        return reply.status(204).send();
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          return reply.status(500).send({ message: error.message });
        }
        return reply.status(500).send({ message: "Erro desconhecido." });
      }
    },
  );
}
