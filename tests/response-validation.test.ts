import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import api from "../src/services/api";
import { listChamados, listChamadoNotifications } from "../src/services/chamadoService";
import { validateArray, validateJsonResponse, validatePaginatedResponse, InvalidApiResponseError } from "../src/utils/apiResponse";
import { chamadoResponseSchema, parseChamadoResponse } from "../src/services/chamadoResponse";
import { parseSessionClaims } from "../apps/api/src/lib/sessionClaims";

const ticket = { id: 1, solicitante_nome: "Teste", titulo: "Teste", descricao: "Descricao de teste", status: "aberto", prioridade_interna: "nao_classificada", aberto_em: "2026-09-25T10:00:00Z", atualizado_em: "2026-09-25T10:00:00Z", resolucoes: [] };

test("JSON: recusa HTML mesmo em HTTP 200 e aceita 204", () => {
  assert.throws(() => validateJsonResponse("<html>Login</html>", "text/html", 200), InvalidApiResponseError);
  assert.throws(() => validateJsonResponse(null, "application/json", 200), InvalidApiResponseError);
  assert.doesNotThrow(() => validateJsonResponse([], "application/json; charset=utf-8", 200));
  assert.doesNotThrow(() => validateJsonResponse(undefined, undefined, 204));
});
test("Listas e paginacao: vazio valido difere de resposta malformada", () => {
  assert.deepEqual(validateArray([]), []);
  for (const value of [undefined, null, {}, "[]"]) assert.throws(() => validateArray(value));
  const page = {data: [], meta:{page:1, limit:10, total:0, totalPages:0}};
  assert.equal(validatePaginatedResponse(page), page);
  assert.throws(() => validatePaginatedResponse({...page, data:{}}));
  assert.throws(() => validatePaginatedResponse({...page, meta:{...page.meta, totalPages:"2"}}));
});
test("Chamados: rejeita item invalido e array de resolucoes ausente", () => {
  assert.equal(parseChamadoResponse(chamadoResponseSchema, ticket).id, 1);
  for (const value of [null, {...ticket, status:"invalido"}, {...ticket,resolucoes:undefined}]) assert.throws(() => parseChamadoResponse(chamadoResponseSchema, value), InvalidApiResponseError);
  assert.throws(() => parseChamadoResponse(z.array(chamadoResponseSchema), [ticket,null]));
});
test("Atualizacao valida seguida de resposta invalida preserva a lista; recupera no proximo polling", async () => {
  const original = api.defaults.adapter;
  let payload: unknown = {data:[ticket]};
  let contentType = "application/json";
  api.defaults.adapter = async config => ({data:payload,status:200,statusText:"OK",headers:{"content-type":contentType},config});
  try {
    let state = await listChamados();
    for(const malformed of [{}, {message:"erro"}, {data:null}, {data:{}}, {data:[null]}]) {
      payload = malformed;
      await assert.rejects(async () => {state=await listChamados();}, InvalidApiResponseError);
      assert.equal(state[0].id, 1);
      assert.equal(state.filter(t=>t.status==='aberto').length,1);
    }
    contentType='text/html';payload='<html>Login</html>';
    await assert.rejects(listChamados, InvalidApiResponseError);
    contentType='application/json';payload={data:[]}; state=await listChamados();assert.deepEqual(state,[]);
    payload={cursor:2,data:[{id:2,chamado_id:1,tipo_evento:'criado',categoria:'abertura',criado_em:'2026-09-25',chamado:{id:1,solicitante_nome:'Teste'}}]};
    assert.equal((await listChamadoNotifications()).data[0].categoria,'abertura');
    payload={cursor:3,data:[{}]};await assert.rejects(listChamadoNotifications, InvalidApiResponseError);
  } finally {api.defaults.adapter=original;}
});
test("JWT: recuperacao de senha, perfil desconhecido e desligado nao sao sessoes", () => {
  const valid={sub:'teste',nome:'Teste',role:'DEV',tokenTipo:'USUARIO_DEV',tipoAcesso:'USUARIO',exp:2000000000};
  assert.equal(parseSessionClaims(valid).sub,'teste');
  assert.equal(parseSessionClaims({...valid,role:'Desenvolvedor'}).role,'DEV');
  for (const role of ['A','C','P','T','E','S','DEV']) assert.equal(parseSessionClaims({...valid,role}).role,role);
  for (const role of ['APRENDIZ','EDUCADOR','EMPRESA']) assert.equal(parseSessionClaims({...valid,role,tipoAcesso:role,tokenTipo:role}).role,role);
  for (const value of [{email:'test@example.invalid',tipoAcesso:'USUARIO',resetSubject:'teste',passwordFingerprint:'test',exp:2000000000},{...valid,role:'D'},{...valid,role:'INVENTADO'},{...valid,sub:''},{...valid,role:'EMPRESA'}]) assert.throws(()=>parseSessionClaims(value));
});

test("Proxy de login: resposta invalida nunca cria cookie de sessao", async () => {
  const { POST } = await import("../src/app/api/auth/login/route");
  const { NextRequest } = await import("next/server");
  const originalFetch = globalThis.fetch;
  const request = () => new NextRequest("https://example.invalid/api/auth/login", {method:"POST",body:JSON.stringify({UsuCodigo:"teste",senha:"teste",tipoAcesso:"USUARIO"})});
  try {
    for (const body of ["<html>erro</html>", "null", JSON.stringify({message:"OK",user:{}})]) {
      globalThis.fetch = async () => new Response(body, {status:200});
      const response = await POST(request());
      assert.equal(response.status,502);
      assert.equal(response.headers.get("set-cookie"),null);
    }
    globalThis.fetch = async () => Response.json({token:"token-de-teste",message:"OK",user:{UsuCodigo:"teste",UsuNome:"Teste",TokenTipo:"USUARIO_DEV",TipoAcesso:"USUARIO"}});
    const success=await POST(request());assert.equal(success.status,200);assert.match(success.headers.get("set-cookie") || "", /HttpOnly/i);
    globalThis.fetch = async () => Response.json({message:"Credenciais invalidas"},{status:401});
    const failure=await POST(request());assert.equal(failure.status,401);assert.equal(failure.headers.get('set-cookie'),null);
  } finally {globalThis.fetch=originalFetch;}
});
