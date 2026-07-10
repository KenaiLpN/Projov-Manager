import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

const allowedNextIdTargets: Record<string, Set<string>> = {
  CA_Aprendiz: new Set(["Apr_Codigo"]),
  CA_AlocacaoAprendiz: new Set(["ALAOrdem"]),
  CA_CapacitacaoAprendiz: new Set(["CapSequencia"]),
  CA_Disciplinas: new Set(["DisCodigo"]),
  CA_Escolas: new Set(["EscCodigo"]),
  CA_funcoesSistema: new Set(["FunSCodigo"]),
  CA_GrauEscolaridade: new Set(["GreCodigo"]),
  CA_GrauParentesco: new Set(["GpaCodigo"]),
  CA_InstituicoesParceiras: new Set(["IpaCodigo"]),
  CA_MotivoDesligamento: new Set(["MotCodigo"]),
  CA_Ocorrencias: new Set(["OcoCodigo"]),
  CA_Orientador: new Set(["OriCodigo"]),
  CA_Parceiros: new Set(["ParCodigo"]),
  CA_ParceirosUnidade: new Set(["ParUniCodigo"]),
  CA_Profissoes: new Set(["ProfCodigo"]),
  CA_RamosAtividades: new Set(["RatCodigo"]),
  CA_Regioes: new Set(["CodRegiao"]),
  CA_RegistroGI: new Set(["GICodigo"]),
  CA_SituacaoAprendiz: new Set(["StaCodigo"]),
};

export async function createWithNextId<T>(
  tableName: string,
  columnName: string,
  createRecord: (tx: Prisma.TransactionClient, nextId: number) => Promise<T>,
): Promise<T> {
  if (!allowedNextIdTargets[tableName]?.has(columnName)) {
    throw new Error(`Destino de ID nao permitido: ${tableName}.${columnName}`);
  }

  const lockName = `next-id:${tableName}.${columnName}`;

  return prisma.$transaction(async (tx) => {
    const lockResult = await tx.$queryRaw<Array<{ locked: number | bigint | null }>>(
      Prisma.sql`SELECT GET_LOCK(${lockName}, 10) AS locked`,
    );
    const locked = Number(lockResult[0]?.locked ?? 0);

    if (locked !== 1) {
      throw new Error(`Nao foi possivel bloquear geracao de ID para ${tableName}.${columnName}`);
    }

    try {
      const table = Prisma.raw(`\`${tableName}\``);
      const column = Prisma.raw(`\`${columnName}\``);
      const result = await tx.$queryRaw<{ maxId: number | null }[]>(
        Prisma.sql`SELECT MAX(${column}) AS maxId FROM ${table}`,
      );
      const maxId = result[0]?.maxId ?? 0;
      return await createRecord(tx, Number(maxId) + 1);
    } finally {
      await tx.$queryRaw(Prisma.sql`SELECT RELEASE_LOCK(${lockName})`);
    }
  });
}
