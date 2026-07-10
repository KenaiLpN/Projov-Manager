import { Prisma } from "@prisma/client";
import { BaseService } from "../lib/baseService";
import { prisma } from "../lib/prisma";
import {
  CreateGrauParentescoBody,
  UpdateGrauParentescoBody,
} from "../schemas/grauParentescoSchema";
export class GrauParentescoService extends BaseService<
  CreateGrauParentescoBody,
  UpdateGrauParentescoBody
> {
  protected tableName = "CA_GrauParentesco";
  protected idField = "GpaCodigo";
  protected searchFields = ["GpaDescricao"];
  protected get model() {
    return prisma.cA_GrauParentesco;
  }
  protected getTxModel(tx: Prisma.TransactionClient) {
    return tx.cA_GrauParentesco;
  }
}
