import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AttendanceService } from "../services/AttendanceService";

const attendanceService = new AttendanceService();

export async function attendanceRoutes(app: FastifyInstance) {
  // GET /attendance/turmas/:id/disciplines
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendance/turmas/:id/disciplines",
    {
      schema: {
        tags: ["Attendance"],
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const disciplines = await attendanceService.getDisciplinesByTurma(id);
      return reply.send(disciplines);
    }
  );

  // GET /attendance/turmas/:id/disciplines/:disciplineId/dates
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendance/turmas/:id/disciplines/:disciplineId/dates",
    {
      schema: {
        tags: ["Attendance"],
        params: z.object({
          id: z.coerce.number(),
          disciplineId: z.coerce.number(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { id, disciplineId } = request.params as { id: number; disciplineId: number };
      const dates = await attendanceService.getDatesByTurmaAndDiscipline(id, disciplineId);
      return reply.send(dates);
    }
  );

  // GET /attendance/turmas/:id/disciplines/:disciplineId/students
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendance/turmas/:id/disciplines/:disciplineId/students",
    {
      schema: {
        tags: ["Attendance"],
        params: z.object({
          id: z.coerce.number(),
          disciplineId: z.coerce.number(),
        }),
        querystring: z.object({
          date: z.string(),
          aula: z.coerce.number().optional().default(1),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { id, disciplineId } = request.params as { id: number; disciplineId: number };
      const { date, aula } = request.query as { date: string; aula: number };
      const students = await attendanceService.getStudentsAttendance(id, disciplineId, new Date(date), aula);
      return reply.send(students);
    }
  );

  // GET /attendance/turmas/:id/dates (todas as datas da turma, sem filtro por disciplina)
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendance/turmas/:id/dates",
    {
      schema: {
        tags: ["Attendance"],
        params: z.object({ id: z.coerce.number() }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const dates = await attendanceService.getDatesByTurmaOnly(id);
      return reply.send(dates);
    }
  );

  // GET /attendance/turmas/:id/students?date=...
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendance/turmas/:id/students",
    {
      schema: {
        tags: ["Attendance"],
        params: z.object({ id: z.coerce.number() }),
        querystring: z.object({ date: z.string() }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const { date } = request.query as { date: string };
      const result = await attendanceService.getStudentsByTurmaDate(id, new Date(date));
      return reply.send(result);
    }
  );

  // GET /attendance/turmas/:id/presenca-list?date=...
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendance/turmas/:id/presenca-list",
    {
      schema: {
        tags: ["Attendance"],
        params: z.object({ id: z.coerce.number() }),
        querystring: z.object({ date: z.string() }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const { date } = request.query as { date: string };
      const result = await attendanceService.getPresencaList(id, new Date(date));
      return reply.send(result);
    }
  );

  // GET /attendance/disciplinas — todas as disciplinas de CA_Disciplinas
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendance/disciplinas",
    { schema: { tags: ["Attendance"] } },
    async (_request, reply: FastifyReply) => {
      const disciplinas = await attendanceService.getAllDisciplinas();
      return reply.send(disciplinas);
    }
  );

  // GET /attendance/capacitacao/turmas
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendance/capacitacao/turmas",
    { schema: { tags: ["Attendance"] } },
    async (_request, reply: FastifyReply) => {
      const turmas = await attendanceService.getCapacitacaoTurmas();
      return reply.send(turmas);
    }
  );

  // GET /attendance/capacitacao/presenca-list?turmaId=X&date=Y
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendance/capacitacao/presenca-list",
    {
      schema: {
        tags: ["Attendance"],
        querystring: z.object({
          turmaId: z.coerce.number(),
          date: z.string(),
        }),
      },
    },
    async (request, reply: FastifyReply) => {
      const { turmaId, date } = request.query as { turmaId: number; date: string };
      const result = await attendanceService.getCapacitacaoPresencaList(turmaId, new Date(date));
      return reply.send(result);
    }
  );

  // POST /attendance/faltas — lançamento de faltas da página pedagógica
  app.withTypeProvider<ZodTypeProvider>().post(
    "/attendance/faltas",
    {
      schema: {
        tags: ["Attendance"],
        body: z.object({
          turmaId: z.number(),
          disciplineId: z.number(),
          date: z.string(),
          periodo: z.number().int().min(1).max(3),
          records: z.array(z.object({
            studentId: z.number(),
            presence: z.string(),
          })),
        }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as {
        turmaId: number;
        disciplineId: number;
        date: string;
        periodo: number;
        records: Array<{ studentId: number; presence: string }>;
      };
      const user = request.user as { sub: string };
      try {
        await attendanceService.saveFaltasLancamento({ ...body, userId: user.sub });
        return reply.status(200).send({ ok: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return reply.status(500).send({ error: message });
      }
    }
  );

  // POST /attendance
  app.withTypeProvider<ZodTypeProvider>().post(
    "/attendance",
    {
      schema: {
        tags: ["Attendance"],
        body: z.object({
          turmaId: z.number(),
          disciplineId: z.number(),
          date: z.string(),
          aula: z.number().int().min(1).max(3),
          records: z.array(
            z.object({
              studentId: z.number(),
              presence: z.string(),
              observation: z.string().optional(),
            })
          ),
        }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply: FastifyReply) => {
      const body = request.body as {
        turmaId: number;
        disciplineId: number;
        date: string;
        aula: number;
        records: Array<{ studentId: number; presence: string; observation?: string }>;
      };
      const user = request.user as { sub: string };
      const result = await attendanceService.saveAttendance({
        ...body,
        userId: user.sub,
      });
      return reply.status(200).send(result);
    }
  );
}
