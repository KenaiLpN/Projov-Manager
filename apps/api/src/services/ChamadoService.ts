import { ChamadoPrioridade, ChamadoStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  ChamadoCreateBody,
  ChamadoResolucaoBody,
  ChamadoUpdateBody,
  ChamadoUrgenciaBody,
} from "../schemas/chamadoSchema";

export type ChamadoUser = {
  sub: string;
  nome?: string;
  role?: string;
};

const ROLE_LABELS: Record<string, string> = {
  A: "Administrador",
  C: "Recepção",
  D: "Desligado",
  E: "Empresarial",
  P: "Pedagógico",
  S: "Pesquisa",
  T: "Técnico",
  DEV: "Desenvolvedor",
};

export class ChamadoServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

function normalizeRole(role?: string) {
  return role?.trim().toUpperCase() ?? "";
}

export function canManageChamados(user: ChamadoUser) {
  return ["T", "DEV"].includes(normalizeRole(user.role));
}

function roleLabel(role?: string) {
  const normalized = normalizeRole(role);
  return ROLE_LABELS[normalized] ?? role ?? "Não definido";
}

function ticketTitle(description: string) {
  const normalized = description.replace(/\s+/g, " ").trim();
  return normalized.length > 180
    ? `${normalized.slice(0, 177).trimEnd()}...`
    : normalized;
}

function optionalText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

const ticketInclude = {
  resolucoes: {
    orderBy: { resolvido_em: "desc" as const },
    take: 1,
  },
} satisfies Prisma.ChamadoTicketInclude;

export class ChamadoService {
  async list(user: ChamadoUser, search?: string) {
    const searchTerm = search?.trim();
    const where: Prisma.ChamadoTicketWhereInput = {
      deletado_em: null,
      ...(canManageChamados(user) ? {} : { solicitante_id: String(user.sub) }),
      ...(searchTerm
        ? {
            OR: [
              { protocolo: { contains: searchTerm } },
              { solicitante_nome: { contains: searchTerm } },
              { departamento_nome: { contains: searchTerm } },
              { descricao: { contains: searchTerm } },
            ],
          }
        : {}),
    };

    return prisma.chamadoTicket.findMany({
      where,
      include: ticketInclude,
      orderBy: [{ atualizado_em: "desc" }, { id: "desc" }],
    });
  }

  async create(user: ChamadoUser, body: ChamadoCreateBody) {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const created = await tx.chamadoTicket.create({
        data: {
          solicitante_id: String(user.sub),
          solicitante_nome: user.nome?.trim() || String(user.sub),
          solicitante_funcao: roleLabel(user.role),
          departamento_nome: body.departamento,
          titulo: ticketTitle(body.descricao),
          descricao: body.descricao,
          observacao: optionalText(body.observacao),
          status: ChamadoStatus.aberto,
          prioridade_interna: ChamadoPrioridade.nao_classificada,
          origem: canManageChamados(user) ? "admin" : "portal",
          aberto_em: now,
          ultima_interacao_em: now,
        },
      });

      const protocolo = `CH-${now.getFullYear()}-${created.id
        .toString()
        .padStart(5, "0")}`;

      const ticket = await tx.chamadoTicket.update({
        where: { id: created.id },
        data: { protocolo },
        include: ticketInclude,
      });

      await tx.chamadoHistorico.create({
        data: {
          chamado_id: created.id,
          usuario_id: String(user.sub),
          usuario_nome: user.nome?.trim() || String(user.sub),
          usuario_tipo: normalizeRole(user.role),
          tipo_evento: "criado",
          status_novo: ChamadoStatus.aberto,
          comentario: "Chamado aberto pelo solicitante.",
          visivel_solicitante: true,
          criado_em: now,
        },
      });

      return ticket;
    });
  }

  async update(user: ChamadoUser, id: bigint, body: ChamadoUpdateBody) {
    const current = await this.findAccessibleTicket(user, id);
    this.ensureEditable(current.status);
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const ticket = await tx.chamadoTicket.update({
        where: { id },
        data: {
          departamento_nome: body.departamento,
          titulo: ticketTitle(body.descricao),
          descricao: body.descricao,
          observacao: optionalText(body.observacao),
          ultima_interacao_em: now,
        },
        include: ticketInclude,
      });

      await tx.chamadoHistorico.create({
        data: {
          chamado_id: id,
          usuario_id: String(user.sub),
          usuario_nome: user.nome?.trim() || String(user.sub),
          usuario_tipo: normalizeRole(user.role),
          tipo_evento: "editado",
          comentario: "Dados do chamado atualizados.",
          visivel_solicitante: true,
          criado_em: now,
        },
      });

      return ticket;
    });
  }

  async updateUrgency(
    user: ChamadoUser,
    id: bigint,
    body: ChamadoUrgenciaBody,
  ) {
    this.ensureTechnical(user);
    const current = await this.findAccessibleTicket(user, id);
    this.ensureEditable(current.status);
    const nextUrgency = body.urgencia as ChamadoPrioridade;
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const ticket = await tx.chamadoTicket.update({
        where: { id },
        data: {
          prioridade_interna: nextUrgency,
          ultima_interacao_em: now,
        },
        include: ticketInclude,
      });

      await tx.chamadoHistorico.create({
        data: {
          chamado_id: id,
          usuario_id: String(user.sub),
          usuario_nome: user.nome?.trim() || String(user.sub),
          usuario_tipo: normalizeRole(user.role),
          tipo_evento: "prioridade_alterada",
          prioridade_anterior: current.prioridade_interna,
          prioridade_nova: nextUrgency,
          comentario: "Urgência do chamado classificada pela equipe técnica.",
          visivel_solicitante: true,
          criado_em: now,
        },
      });

      return ticket;
    });
  }

  async resolve(
    user: ChamadoUser,
    id: bigint,
    body: ChamadoResolucaoBody,
  ) {
    this.ensureTechnical(user);
    const current = await this.findAccessibleTicket(user, id);
    if (current.status === ChamadoStatus.resolvido) {
      throw new ChamadoServiceError("Este chamado já foi resolvido.", 409);
    }
    if (current.status === ChamadoStatus.cancelado) {
      throw new ChamadoServiceError(
        "Um chamado cancelado não pode ser resolvido.",
        409,
      );
    }

    const now = new Date();
    const observation = optionalText(body.observacao);

    return prisma.$transaction(async (tx) => {
      await tx.chamadoResolucao.create({
        data: {
          chamado_id: id,
          usuario_id: String(user.sub),
          usuario_nome: user.nome?.trim() || String(user.sub),
          observacao: observation,
          resolvido_em: now,
        },
      });

      const ticket = await tx.chamadoTicket.update({
        where: { id },
        data: {
          status: ChamadoStatus.resolvido,
          resolvido_em: now,
          ultima_interacao_em: now,
        },
        include: ticketInclude,
      });

      await tx.chamadoHistorico.create({
        data: {
          chamado_id: id,
          usuario_id: String(user.sub),
          usuario_nome: user.nome?.trim() || String(user.sub),
          usuario_tipo: normalizeRole(user.role),
          tipo_evento: "resolucao",
          status_anterior: current.status,
          status_novo: ChamadoStatus.resolvido,
          comentario: observation || "Chamado resolvido pela equipe técnica.",
          visivel_solicitante: true,
          criado_em: now,
        },
      });

      return ticket;
    });
  }

  private async findAccessibleTicket(user: ChamadoUser, id: bigint) {
    const ticket = await prisma.chamadoTicket.findFirst({
      where: {
        id,
        deletado_em: null,
        ...(canManageChamados(user)
          ? {}
          : { solicitante_id: String(user.sub) }),
      },
    });

    if (!ticket) {
      throw new ChamadoServiceError("Chamado não encontrado.", 404);
    }

    return ticket;
  }

  private ensureTechnical(user: ChamadoUser) {
    if (!canManageChamados(user)) {
      throw new ChamadoServiceError(
        "Somente técnicos e desenvolvedores podem executar esta ação.",
        403,
      );
    }
  }

  private ensureEditable(status: ChamadoStatus) {
    if (
      status === ChamadoStatus.resolvido ||
      status === ChamadoStatus.cancelado
    ) {
      throw new ChamadoServiceError(
        "Chamados resolvidos ou cancelados não podem ser editados.",
        409,
      );
    }
  }
}
