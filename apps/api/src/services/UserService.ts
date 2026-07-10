import { prisma } from "../lib/prisma";
import { CreateUserBody, UpdateUserBody } from "../schemas/userSchema";
export class UserService {
  async getUserByCode(code: string) {
    return await (prisma as any).cA_Usuarios.findFirst({
      where: { UsuCodigo: code },
    });
  }
  async getPublicUserByCode(code: string) {
    return await (prisma as any).cA_Usuarios.findFirst({
      where: { UsuCodigo: code },
      select: {
        UsuCodigo: true,
        UsuNome: true,
        UsuEmail: true,
        UsuTipo: true,
        chk_ativo: true,
        id_usuario: true,
        criado_em: true,
        atualizado_em: true,
      },
    });
  }
  async createUser(data: CreateUserBody) {
    return await (prisma as any).cA_Usuarios.create({
      data: {
        UsuCodigo: data.UsuCodigo,
        UsuNome: data.UsuNome,
        UsuEmail: data.UsuEmail ?? null,
        UsuSenha: data.UsuSenha,
        UsuTipo: data.UsuTipo ?? null,
        chk_ativo: true,
      },
    });
  }
  async getAllUsers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { UsuNome: { contains: search } },
            { UsuEmail: { contains: search } },
            { UsuCodigo: { contains: search } },
          ],
        }
      : {};
    const [users, total] = await Promise.all([
      (prisma as any).cA_Usuarios.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criado_em: "asc" },
      }),
      (prisma as any).cA_Usuarios.count({ where }),
    ]);
    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async updateUser(code: string, data: UpdateUserBody) {
    const user = await this.getUserByCode(code);
    if (!user) return null;
    return await (prisma as any).cA_Usuarios.update({
      where: { UsuCodigo: code },
      data: {
        UsuNome: data.UsuNome ?? undefined,
        UsuEmail: data.UsuEmail ?? undefined,
        UsuTipo: data.UsuTipo ?? undefined,
        UsuSenha: data.UsuSenha ?? undefined,
      },
    });
  }
  async deleteUser(code: string) {
    const user = await this.getUserByCode(code);
    if (!user) return null;
    await (prisma as any).cA_Usuarios.delete({
      where: { UsuCodigo: code },
    });
    return { success: true };
  }
}
