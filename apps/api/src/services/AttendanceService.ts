import { prisma } from "../lib/prisma";

export class AttendanceService {
  /**
   * Puxa todas as disciplinas associadas a uma turma específica através do plano ou agendamento.
   */
  async getDisciplinesByTurma(turmaId: number) {
    try {
      // Buscamos primeiro as disciplinas vinculadas diretamente ao professor/turma
      const dpTurma = await prisma.cA_DisciplinasTurmaProf.findMany({
        where: { DPTurma: turmaId },
        select: {
          DPDisciplina: true,
        },
        distinct: ['DPDisciplina'],
      });

      const disciplineIds = dpTurma.map((d) => d.DPDisciplina);

      // Agora buscamos os detalhes das disciplinas
      const disciplines = await prisma.cA_Disciplinas.findMany({
        where: {
          DisCodigo: { in: disciplineIds },
        },
      });

      return disciplines;
    } catch (error) {
      console.error("Erro ao buscar disciplinas da turma:", error);
      throw error;
    }
  }

  async getAllDisciplinas() {
    return prisma.cA_Disciplinas.findMany({
      select: { DisCodigo: true, DisDescricao: true },
      orderBy: { DisDescricao: "asc" },
    });
  }

  /**
   * Puxa todas as datas de aula agendadas para uma turma e disciplina específicas.
   */
  async getDatesByTurmaAndDiscipline(turmaId: number, disciplineId: number) {
    try {
      const dates = await prisma.cA_AulasDisciplinasTurmaProf.findMany({
        where: {
          ADPTurma: turmaId,
          ADPDisciplina: disciplineId,
        },
        select: {
          ADPDataAula: true,
        },
        orderBy: {
          ADPDataAula: 'asc',
        },
        distinct: ['ADPDataAula'],
      });

      return dates.map(d => d.ADPDataAula);
    } catch (error) {
      console.error("Erro ao buscar datas da disciplina na turma:", error);
      throw error;
    }
  }

  /**
   * Retorna os alunos alocados na turma e ativos na data informada.
   * Usa CA_AlocacaoAprendiz como fonte de verdade (ALADataInicio <= date e
   * ALADataTermino >= date ou nulo, com fallback para ALADataPrevTermino).
   */
  async getStudentsByTurmaDate(turmaId: number, date: Date) {
    try {
      const allocations = await prisma.cA_AlocacaoAprendiz.findMany({
        where: {
          ALATurma: turmaId,
          ALAStatus: 'A',
          ALADataInicio: { lte: date },
          OR: [
            // Contrato ainda aberto (data término real não preenchida): usa previsão
            {
              ALADataTermino: null,
              ALADataPrevTermino: { gte: date },
            },
            // Contrato encerrado: verifica data de término real
            { ALADataTermino: { gte: date } },
          ],
        },
        select: { ALAAprendiz: true },
        distinct: ['ALAAprendiz'],
      });

      if (allocations.length === 0) return [];

      const studentIds = allocations.map(a => BigInt(a.ALAAprendiz));

      const students = await prisma.cA_Aprendiz.findMany({
        where: { Apr_Codigo: { in: studentIds } },
        select: { Apr_Codigo: true, Apr_Nome: true },
        orderBy: { Apr_Nome: 'asc' },
      });

      return students.map(s => ({
        IdAluno: Number(s.Apr_Codigo),
        NomeJovem: s.Apr_Nome,
      }));
    } catch (error) {
      console.error("Erro ao buscar alunos da turma:", error);
      throw error;
    }
  }

  /**
   * Puxa a lista de alunos da turma filtrando por Apr_Turma e pelo range de datas
   * Apr_InicioAprendizagem <= date <= Apr_PrevFimAprendizagem.
   * Já traz o status de presença se houver registro na data.
   */
  async getStudentsAttendance(turmaId: number, disciplineId: number, date: Date, aula: number = 1) {
    try {
      const allocations = await prisma.cA_AlocacaoAprendiz.findMany({
        where: {
          ALATurma: turmaId,
          ALAStatus: 'A',
          ALADataInicio: { lte: date },
          OR: [
            { ALADataTermino: null, ALADataPrevTermino: { gte: date } },
            { ALADataTermino: { gte: date } },
          ],
        },
        select: { ALAAprendiz: true },
        distinct: ['ALAAprendiz'],
      });

      const studentIds = allocations.map(a => BigInt(a.ALAAprendiz));

      const students = studentIds.length
        ? await prisma.cA_Aprendiz.findMany({
            where: { Apr_Codigo: { in: studentIds } },
            select: { Apr_Codigo: true, Apr_Nome: true },
            orderBy: { Apr_Nome: 'asc' },
          })
        : [];

      const attendance = await prisma.cA_AulasDisciplinasAprendiz.findMany({
        where: { AdiTurma: turmaId, AdiDisciplina: disciplineId, AdiDataAula: date },
        select: { AdiCodAprendiz: true, AdiPresenca: true, AdiPresencaTarde: true, AdiObservacoes: true },
      });

      const attendanceMap = new Map(attendance.map(a => [a.AdiCodAprendiz, a]));

      return students.map(student => {
        const rec = attendanceMap.get(Number(student.Apr_Codigo));
        const presenca = aula === 2 ? rec?.AdiPresencaTarde : rec?.AdiPresenca;
        return {
          IdAluno: Number(student.Apr_Codigo),
          NomeJovem: student.Apr_Nome,
          Presenca: presenca || null,
          Observacao: rec?.AdiObservacoes || "",
        };
      });
    } catch (error) {
      console.error("Erro ao buscar relação de alunos e faltas:", error);
      throw error;
    }
  }

  /**
   * Salva o lançamento de faltas da página de faltas.
   * AdiEducador vem do id_usuario do usuário logado (link CA_Usuarios → CA_Educadores).
   * Periodo 2 = Tarde → grava em AdiPresencaTarde; demais → grava em AdiPresenca.
   */
  async saveFaltasLancamento(data: {
    turmaId: number;
    disciplineId: number;
    date: string;
    periodo: number;
    records: Array<{ studentId: number; presence: string }>;
    userId: string;
  }) {
    try {
      const usuario = await prisma.cA_Usuarios.findUnique({
        where: { UsuCodigo: data.userId },
        select: { id_usuario: true },
      });

      const educadorId = usuario?.id_usuario ?? 0;
      const dataAula = new Date(data.date);
      const now = new Date();
      const isTarde = data.periodo === 2;

      for (const r of data.records) {
        const presenca      = isTarde ? "." : r.presence;
        const presencaTarde = isTarde ? r.presence : ".";
        await prisma.$executeRaw`
          INSERT INTO CA_AulasDisciplinasAprendiz
            (AdiCodAprendiz, AdiTurma, AdiDisciplina, AdiEducador, AdiDataAula,
             AdiCargaHoraria, AdiPresenca, AdiPresencaTarde, AdiObservacoes, AdiUsuario, AdiDataAlteracao)
          VALUES (${r.studentId}, ${data.turmaId}, ${data.disciplineId}, ${educadorId}, ${dataAula}, 2, ${presenca}, ${presencaTarde}, NULL, NULL, ${now})
          ON DUPLICATE KEY UPDATE
            AdiPresenca      = VALUES(AdiPresenca),
            AdiPresencaTarde = VALUES(AdiPresencaTarde),
            AdiDataAlteracao = VALUES(AdiDataAlteracao)
        `;
      }
    } catch (error) {
      console.error("Erro ao salvar lançamentos de falta:", error);
      throw error;
    }
  }

  /**
   * Salva ou atualiza os lançamentos de falta.
   */
  async saveAttendance(data: {
    turmaId: number;
    disciplineId: number;
    date: string;
    aula: number; // 1 → AdiPresenca | 2 → AdiPresencaTarde
    records: Array<{ studentId: number; presence: string; observation?: string }>;
    userId: string;
  }) {
    try {
      const attendanceDate = new Date(data.date);

      const classInfo = await prisma.cA_AulasDisciplinasTurmaProf.findFirst({
        where: { ADPTurma: data.turmaId, ADPDisciplina: data.disciplineId, ADPDataAula: attendanceDate },
        select: { ADPprofessor: true },
      });

      if (!classInfo) {
        throw new Error("Agendamento de aula não encontrado para esta turma/disciplina/data.");
      }

      return await prisma.$transaction(async (tx) => {
        const results = [];

        for (const record of data.records) {
          // Campos de update e create variam conforme a aula selecionada
          const updateFields = data.aula === 2
            ? { AdiPresencaTarde: record.presence, AdiDataAlteracao: new Date(), AdiUsuario: data.userId }
            : { AdiPresenca: record.presence, AdiDataAlteracao: new Date(), AdiUsuario: data.userId };

          const res = await tx.cA_AulasDisciplinasAprendiz.upsert({
            where: {
              AdiCodAprendiz_AdiTurma_AdiDisciplina_AdiEducador_AdiDataAula: {
                AdiCodAprendiz: record.studentId,
                AdiTurma: data.turmaId,
                AdiDisciplina: data.disciplineId,
                AdiEducador: classInfo.ADPprofessor,
                AdiDataAula: attendanceDate,
              }
            },
            update: {
              ...updateFields,
              AdiObservacoes: record.observation || "",
            },
            create: {
              AdiCodAprendiz: record.studentId,
              AdiTurma: data.turmaId,
              AdiDisciplina: data.disciplineId,
              AdiEducador: classInfo.ADPprofessor,
              AdiDataAula: attendanceDate,
              AdiPresenca: data.aula === 2 ? '.' : record.presence,
              AdiPresencaTarde: data.aula === 2 ? record.presence : '.',
              AdiCargaHoraria: 2,
              AdiObservacoes: record.observation || "",
              AdiUsuario: data.userId,
            }
          });
          results.push(res);
        }

        return results;
      });
    } catch (error) {
      console.error("Erro ao salvar lançamentos de falta:", error);
      throw error;
    }
  }

  /**
   * Retorna datas da turma: todas as datas existentes em CA_AulasDisciplinasTurmaProf
   * mais as datas futuras (até 1 mês) no mesmo dia da semana, ordenadas desc.
   */
  async getDatesByTurmaOnly(turmaId: number) {
    try {
      const records = await prisma.cA_AulasDisciplinasTurmaProf.findMany({
        where: { ADPTurma: turmaId },
        select: { ADPDataAula: true },
        orderBy: { ADPDataAula: 'desc' },
        distinct: ['ADPDataAula'],
      });

      // Normaliza para strings YYYY-MM-DD usando UTC (evita problemas de timezone)
      const existingKeys = records.map(d => (d.ADPDataAula as Date).toISOString().slice(0, 10));

      // Determina o dia da semana predominante usando UTC
      let targetDow: number | null = null;
      if (existingKeys.length > 0) {
        const dowCounts: Record<number, number> = {};
        for (const key of existingKeys) {
          const [y, m, day] = key.split('-').map(Number);
          const dow = new Date(Date.UTC(y, m - 1, day)).getUTCDay();
          dowCounts[dow] = (dowCounts[dow] ?? 0) + 1;
        }
        targetDow = Number(Object.entries(dowCounts).sort((a, b) => b[1] - a[1])[0][0]);
      }

      // Gera datas futuras no mesmo dia da semana até 1 mês à frente (tudo em UTC)
      const futureKeys: string[] = [];
      if (targetDow !== null) {
        const now = new Date();
        const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        const limitUtc = new Date(todayUtc);
        limitUtc.setUTCMonth(limitUtc.getUTCMonth() + 1);

        // Começa de amanhã e avança até encontrar o targetDow
        const cursor = new Date(todayUtc);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
        while (cursor.getUTCDay() !== targetDow) cursor.setUTCDate(cursor.getUTCDate() + 1);

        while (cursor <= limitUtc) {
          futureKeys.push(cursor.toISOString().slice(0, 10));
          cursor.setUTCDate(cursor.getUTCDate() + 7);
        }
      }

      // Junta, deduplica e ordena desc
      const seen = new Set<string>(existingKeys);
      const allKeys = [...existingKeys];
      for (const k of futureKeys) {
        if (!seen.has(k)) { seen.add(k); allKeys.push(k); }
      }
      allKeys.sort((a, b) => b.localeCompare(a));

      return allKeys;
    } catch (error) {
      console.error("Erro ao buscar datas da turma:", error);
      throw error;
    }
  }

  /**
   * Retorna as turmas que possuem capacitações registradas.
   */
  async getCapacitacaoTurmas() {
    try {
      const caps = await prisma.cA_CapacitacaoAprendiz.findMany({
        where: { CapStatus: 'A' },
        select: { CapTurma: true },
        distinct: ['CapTurma'],
      });
      const turmaIds = caps.map(c => c.CapTurma);
      return await prisma.cA_Turmas.findMany({
        where: { TurCodigo: { in: turmaIds } },
        select: { TurCodigo: true, TurNome: true },
        orderBy: { TurNome: 'asc' },
      });
    } catch (error) {
      console.error("Erro ao buscar turmas de capacitação:", error);
      throw error;
    }
  }

  /**
   * Gera a lista de presença de capacitação para uma turma na data informada.
   * Filtra os alunos ativos no período (CapDataInicio <= date <= CapDataPrevTermino)
   * e com Apr_Situacao = 6.
   */
  async getCapacitacaoPresencaList(turmaId: number, date: Date) {
    try {
      const turma = await prisma.cA_Turmas.findUnique({
        where: { TurCodigo: turmaId },
        select: { TurNome: true, TurUnidade: true },
      });

      const capacitacoes = await prisma.cA_CapacitacaoAprendiz.findMany({
        where: {
          CapTurma: turmaId,
          CapDataInicio: { lte: date },
          OR: [
            { CapDataPrevTermino: null },
            { CapDataPrevTermino: { gte: date } },
          ],
        },
        select: { CapAprendiz: true },
      });

      const studentIds = [...new Set(capacitacoes.map(c => c.CapAprendiz))];

      const [unidade, students] = await Promise.all([
        turma?.TurUnidade
          ? prisma.cA_Unidades.findUnique({
              where: { UniCodigo: turma.TurUnidade },
              select: {
                UniNome: true,
                UniEndereco: true,
                UniNumeroEndereco: true,
                UniBairro: true,
                UniCEP: true,
                UniCidade: true,
                UniEstado: true,
                UniTelefone: true,
              },
            })
          : Promise.resolve(null),
        studentIds.length
          ? prisma.cA_Aprendiz.findMany({
              where: {
                Apr_Codigo: { in: studentIds.map(id => BigInt(id)) },
              },
              select: { Apr_Codigo: true, Apr_Nome: true },
              orderBy: { Apr_Nome: 'asc' },
            })
          : Promise.resolve([]),
      ]);

      return {
        turma: {
          nome: turma?.TurNome || '',
          nucleo: unidade?.UniNome || '',
          endereco: [unidade?.UniEndereco, unidade?.UniNumeroEndereco].filter(Boolean).join(', '),
          bairro: unidade?.UniBairro || '',
          cidade: unidade?.UniCidade || '',
          estado: unidade?.UniEstado || '',
          cep: unidade?.UniCEP || '',
          telefone: unidade?.UniTelefone || '',
        },
        students: students.map(s => ({
          IdAluno: Number(s.Apr_Codigo),
          NomeJovem: s.Apr_Nome,
        })),
      };
    } catch (error) {
      console.error("Erro ao gerar lista de presença de capacitação:", error);
      throw error;
    }
  }

  /**
   * Puxa a lista de presença (alunos com unidade do parceiro) para impressão.
   * Filtra por aprendizes alocados na turma que estavam ativos na data informada.
   */
  async getPresencaList(turmaId: number, date: Date) {
    try {
      const [turma, allocations] = await Promise.all([
        prisma.cA_Turmas.findUnique({
          where: { TurCodigo: turmaId },
          select: { TurNome: true, TurUnidade: true },
        }),
        prisma.cA_AlocacaoAprendiz.findMany({
          where: {
            ALATurma: turmaId,
            ALADataInicio: { lte: date },
            OR: [
              { ALADataTermino: null },
              { ALADataTermino: { gte: date } },
            ],
          },
          select: { ALAAprendiz: true, ALAUnidadeParceiro: true },
          orderBy: { ALAOrdem: 'desc' },
        }),
      ]);

      // Pega a alocação mais recente por aluno (já ordenado por desc)
      const allocationMap = new Map<number, number>();
      const studentIds: number[] = [];
      for (const a of allocations) {
        if (!allocationMap.has(a.ALAAprendiz)) {
          allocationMap.set(a.ALAAprendiz, a.ALAUnidadeParceiro);
          studentIds.push(a.ALAAprendiz);
        }
      }

      const [unidade, students] = await Promise.all([
        turma?.TurUnidade
          ? prisma.cA_Unidades.findUnique({
              where: { UniCodigo: turma.TurUnidade },
              select: { UniNome: true },
            })
          : Promise.resolve(null),
        studentIds.length
          ? prisma.cA_Aprendiz.findMany({
              where: {
                Apr_Codigo: { in: studentIds.map(id => BigInt(id)) },
                Apr_Situacao: BigInt(6),
              },
              select: { Apr_Codigo: true, Apr_Nome: true },
              orderBy: { Apr_Nome: 'asc' },
            })
          : Promise.resolve([]),
      ]);

      const unitIds = [...new Set([...allocationMap.values()])];
      const partnerUnits = unitIds.length
        ? await prisma.cA_ParceirosUnidade.findMany({
            where: { ParUniCodigo: { in: unitIds } },
            select: { ParUniCodigo: true, ParUniDescricao: true },
          })
        : [];
      const partnerUnitMap = new Map(partnerUnits.map(u => [u.ParUniCodigo, u.ParUniDescricao]));

      return {
        turma: {
          nome: turma?.TurNome || '',
          nucleo: unidade?.UniNome || 'PROJOV SEDE',
        },
        students: students.map(s => {
          const unitId = allocationMap.get(Number(s.Apr_Codigo));
          return {
            IdAluno: Number(s.Apr_Codigo),
            NomeJovem: s.Apr_Nome,
            UnidadeParceiro: unitId ? (partnerUnitMap.get(unitId) || '') : '',
          };
        }),
      };
    } catch (error) {
      console.error("Erro ao gerar lista de presença:", error);
      throw error;
    }
  }
}
