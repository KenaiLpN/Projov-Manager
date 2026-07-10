import "@fastify/jwt";
declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      sub: string;
      nome?: string;
      name?: string;
      role?: string;
      tokenTipo?: string;
      tipoAcesso?: string;
    };
  }
}
declare module "fastify" {
  export interface FastifyInstance {
    authenticate: any;
  }
}
