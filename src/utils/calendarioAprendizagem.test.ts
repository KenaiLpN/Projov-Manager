import test from "node:test";
import assert from "node:assert";
import { gerarCalendario } from "./calendarioAprendizagem";

test("gerarCalendario deve inicializar calendario corretamente e contabilizar carga horaria basica", () => {
  const mockCalendario = gerarCalendario({
    nomeAprendiz: "Jovem Teste",
    curso: "Administracao",
    empresa: "Empresa Parceira S/A",
    jornadaDiaria: "6",
    diasTeoria: "52",
    diasPratica: "208",
    dataAdmissao: "2026-03-01",
    dataTerminoIntrodutorios: "2026-03-15",
    diaEncontroSemanal: "Segunda-Feira",
    dataInicioEncontroSemanal: "2026-03-16",
    diaEncontroMensal: "Terca-Feira",
    semanaEncontroMensal: "Primeira Semana",
    folga: "Sabado e Domingo",
    feriados: [new Date("2026-12-25")],
  });

  assert.ok(mockCalendario.resumo !== undefined);
  assert.strictEqual(mockCalendario.nomeAprendiz, "Jovem Teste");
  assert.strictEqual(mockCalendario.curso, "Administracao");
  assert.ok(mockCalendario.resumo.totalEncontros > 0);
  assert.ok(mockCalendario.resumo.totalHoras > 0);
  assert.ok(mockCalendario.resumo.encontrosTeoria > 0);
  assert.ok(mockCalendario.resumo.encontrosPratica > 0);
  assert.ok(mockCalendario.meses.length >= 12);

  const primeiroMes = mockCalendario.meses[0];
  assert.strictEqual(primeiroMes.ano, 2026);
  assert.strictEqual(primeiroMes.mes, 2);
});

test("gerarCalendario deve calcular ausencias e dias inativos com base nas ferias e suspensao", () => {
  const mockComFerias = gerarCalendario({
    nomeAprendiz: "Aprendiz de Ferias",
    curso: "Logistica",
    empresa: "Transportes BR",
    jornadaDiaria: "4",
    diasTeoria: "40",
    diasPratica: "160",
    dataAdmissao: "2026-01-01",
    dataTerminoIntrodutorios: "2026-01-10",
    diaEncontroSemanal: "Sexta-Feira",
    dataInicioEncontroSemanal: "2026-01-11",
    diaEncontroMensal: "Segunda-Feira",
    semanaEncontroMensal: "Segunda Semana",
    folga: "Sabado e Domingo",
    feriados: [],
    periodoFeriasDe: "2026-06-01",
    periodoFeriasAte: "2026-06-30",
    periodoSuspensaoDe: "2026-08-01",
    periodoSuspensaoAte: "2026-08-15",
  });

  assert.ok(mockComFerias.meses.length > 0);

  let temDiaFerias = false;
  let temDiaSuspensao = false;

  mockComFerias.meses.forEach((m) => {
    m.semanas.forEach((sem) => {
      sem.forEach((dia) => {
        if (!dia) return;
        if (dia.tipo === "ferias") temDiaFerias = true;
        if (dia.tipo === "suspensao") temDiaSuspensao = true;
      });
    });
  });

  assert.ok(temDiaFerias, "Deveria conter dias previstos como ferias");
  assert.ok(temDiaSuspensao, "Deveria conter dias previstos na suspensao");
});
