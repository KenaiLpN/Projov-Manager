import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { createWithNextId } from "./nextId";
export abstract class BaseService<
  TCreate extends object,
  TUpdate extends object,
> {
  protected abstract tableName: string;
  protected abstract idField: string;
  protected abstract searchFields: string[];
  protected orderBy?: any;
  protected abstract get model(): any;
  protected abstract getTxModel(tx: Prisma.TransactionClient): any;
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: this.searchFields.map((field) => ({
            [field]: { contains: search },
          })),
        }
      : undefined;
    try {
      const orderByClause = this.orderBy ?? { [this.idField]: "desc" };
      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take: limit,
          orderBy: orderByClause,
        }),
        this.model.count({ where }),
      ]);
      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(`[${this.tableName}] Erro ao listar:`, error);
      throw error;
    }
  }
  async getById(id: number) {
    try {
      const record = await this.model.findUnique({
        where: { [this.idField]: id },
      });
      return record ?? null;
    } catch (error) {
      console.error(`[${this.tableName}] Erro ao buscar por ID ${id}:`, error);
      throw error;
    }
  }
  async create(data: TCreate) {
    try {
      return await createWithNextId(this.tableName, this.idField, (tx, nextId) => this.getTxModel(tx).create({
        data: { [this.idField]: nextId, ...data },
      }));
    } catch (error) {
      console.error(`[${this.tableName}] Erro ao criar:`, error);
      throw error;
    }
  }
  async update(id: number, data: TUpdate) {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(payload).length === 0) return null;
    try {
      return await this.model.update({
        where: { [this.idField]: id },
        data: payload,
      });
    } catch (error: any) {
      if (error?.code === "P2025") return null; 
      console.error(`[${this.tableName}] Erro ao atualizar ID ${id}:`, error);
      throw error;
    }
  }
  async delete(id: number) {
    try {
      await this.model.delete({ where: { [this.idField]: id } });
      return { success: true };
    } catch (error: any) {
      if (error?.code === "P2025") return null; 
      console.error(`[${this.tableName}] Erro ao deletar ID ${id}:`, error);
      throw error;
    }
  }
}
