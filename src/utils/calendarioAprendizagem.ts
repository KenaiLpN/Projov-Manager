// ============================================================
// Calendario da Aprendizagem - Geração automática
// Baseado no modelo do sistema legado (Projov / AgilSist)
// ============================================================

export type TipoDia =
  | "introducao" // Amarelo: Período introdutório
  | "semanal" // Azul escuro: Encontro semanal (teoria)
  | "mensal" // Azul escuro: Encontro mensal (atividade complementar)
  | "pratica" // Verde: Prática na empresa
  | "feriado" // Vermelho: Feriado
  | "ferias" // Azul claro: Férias
  | "suspensao" // Cinza: Período de suspensão
  | "finaldesemana" // Cinza claro: Sábado/Domingo
  | "inactive" // Cinza: Dia útil sem atividade (antes do início ou após o término)
  | "vazio"; // Célula vazia (preenchimento do grid)

export interface DiaCalendario {
  dia: number; // 1-31
  tipo: TipoDia;
  label: string; // "I", "T", "M", "P", "F", "Fe", "S", ""
  date: Date;
}

export interface MesCalendario {
  ano: number;
  mes: number; // 0-11
  nome: string; // "MARÇO 2026"
  semanas: (DiaCalendario | null)[][]; // 6 semanas x 7 dias (null = vazio)
}

export interface ResumoCalendario {
  encontrosTeoria: number;
  horasTeoria: number;
  porcentagemTeoria: number;
  encontrosPratica: number;
  horasPratica: number;
  porcentagemPratica: number;
  totalEncontros: number;
  totalHoras: number;
  inicioFormacao: string;
}

export interface CalendarioGerado {
  meses: MesCalendario[];
  resumo: ResumoCalendario;
  nomeAprendiz: string;
  curso: string;
  empresa: string;
  cargaHorariaDiaria: string;
  diaEncontroSemanal: string;
  atividadeComplementar: string;
  introdutorios: string;
  duracaoContrato: string;
}

export interface CalendarioInput {
  nomeAprendiz: string;
  curso: string;
  empresa: string;
  jornadaDiaria: string; // ex: "4" ou "6"
  diasTeoria: string; // dias de aprendizagem teórica
  diasPratica: string; // dias de aprendizagem prática
  dataAdmissao: string; // YYYY-MM-DD
  dataTerminoIntrodutorios: string; // YYYY-MM-DD
  dataTerminoContrato: string; // YYYY-MM-DD (pode vir de DataPrevistaTermino)
  diaEncontroSemanal: string; // "Segunda-Feira", "Terça-Feira", etc
  dataInicioEncontroSemanal: string; // YYYY-MM-DD
  diaEncontroMensal: string; // "Segunda-Feira", etc
  semanaEncontroMensal: string; // "Primeira Semana", "Segunda Semana", etc
  folga: string; // "Normal", "Sábado", "Domingo", "Sábado e Domingo"
  feriados: Date[]; // Lista de feriados
  periodoFeriasDe?: string;
  periodoFeriasAte?: string;
  periodoFerias2De?: string;
  periodoFerias2Ate?: string;
  periodoSuspensaoDe?: string;
  periodoSuspensaoAte?: string;
}

// ============== Constantes ==============

const NOMES_MESES = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
];

const DIAS_SEMANA_MAP: Record<string, number> = {
  Domingo: 0,
  "Segunda-Feira": 1,
  "Terça-Feira": 2,
  "Quarta-Feira": 3,
  "Quinta-Feira": 4,
  "Sexta-Feira": 5,
  Sábado: 6,
};

const SEMANA_MAP: Record<string, number> = {
  "Primeira Semana": 1,
  "Segunda Semana": 2,
  "Terceira Semana": 3,
  "Quarta Semana": 4,
  "Última Semana": -1,
};

// ============== Feriados Nacionais ==============

export function getFeriadosNacionais(ano: number): Date[] {
  const feriados: Date[] = [
    new Date(ano, 0, 1), // Ano Novo
    new Date(ano, 3, 21), // Tiradentes
    new Date(ano, 4, 1), // Dia do Trabalhador
    new Date(ano, 8, 7), // Independência
    new Date(ano, 9, 12), // N.S. Aparecida
    new Date(ano, 10, 2), // Finados
    new Date(ano, 10, 15), // Proclamação da República
    new Date(ano, 11, 25), // Natal
  ];

  // Páscoa (algoritmo de Gauss)
  const pascoa = calcularPascoa(ano);
  feriados.push(pascoa);

  // Sexta-feira Santa (2 dias antes da Páscoa)
  const sextaSanta = new Date(pascoa);
  sextaSanta.setDate(sextaSanta.getDate() - 2);
  feriados.push(sextaSanta);

  // Carnaval: Segunda-feira = 48 dias antes da Páscoa, Terça = 47 dias
  const carnaval = new Date(pascoa);
  carnaval.setDate(carnaval.getDate() - 48); // Segunda de Carnaval
  feriados.push(carnaval);

  // Terça de Carnaval (47 dias antes da Páscoa, 1 dia depois da segunda)
  const tercaCarnaval = new Date(pascoa);
  tercaCarnaval.setDate(tercaCarnaval.getDate() - 47); // Correção: era -47 igual à segunda
  feriados.push(tercaCarnaval);

  // Corpus Christi (60 dias após a Páscoa)
  const corpusChristi = new Date(pascoa);
  corpusChristi.setDate(corpusChristi.getDate() + 60);
  feriados.push(corpusChristi);

  return feriados;
}

function calcularPascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes, dia);
}

// ============== Helpers ==============

function sameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function inRange(date: Date, start: Date, end: Date): boolean {
  const d = date.getTime();
  const s = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  ).getTime();
  const e = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  ).getTime();
  return d >= s && d <= e;
}

function parseDate(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function isFeriado(date: Date, feriados: Date[]): boolean {
  return feriados.some((f) => sameDay(date, f));
}

/** Retorna true se o dia é fim de semana (considerando configuração de folga) */
function isFimDeSemana(date: Date, folga: string): boolean {
  const dow = date.getDay();

  switch (folga) {
    case "Sábado":
      return dow === 6;
    case "Domingo":
      return dow === 0;
    case "Sábado e Domingo":
      return dow === 0 || dow === 6;
    case "Normal":
    default:
      // Normal = sábado e domingo são folga
      return dow === 0 || dow === 6;
  }
}

/** Retorna a N-ésima ocorrência de um dia da semana no mês */
function getNthWeekdayOfMonth(
  ano: number,
  mes: number,
  diaSemana: number,
  n: number,
): Date | null {
  if (n === -1) {
    // Última ocorrência
    const ultimoDia = new Date(ano, mes + 1, 0);
    for (let d = ultimoDia.getDate(); d >= 1; d--) {
      const dt = new Date(ano, mes, d);
      if (dt.getDay() === diaSemana) return dt;
    }
    return null;
  }

  let count = 0;
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  for (let d = 1; d <= diasNoMes; d++) {
    const dt = new Date(ano, mes, d);
    if (dt.getDay() === diaSemana) {
      count++;
      if (count === n) return dt;
    }
  }
  return null;
}

// ============== Geração do Calendário ==============

export function gerarCalendario(input: CalendarioInput): CalendarioGerado {
  const dataAdmissao = parseDate(input.dataAdmissao)!;
  const dataTerminoIntro = parseDate(input.dataTerminoIntrodutorios);
  const dataTerminoContrato = parseDate(input.dataTerminoContrato)!;
  const dataInicioSemanal = parseDate(input.dataInicioEncontroSemanal);

  const feriasDe = parseDate(input.periodoFeriasDe || "");
  const feriasAte = parseDate(input.periodoFeriasAte || "");
  const ferias2De = parseDate(input.periodoFerias2De || "");
  const ferias2Ate = parseDate(input.periodoFerias2Ate || "");
  const suspensaoDe = parseDate(input.periodoSuspensaoDe || "");
  const suspensaoAte = parseDate(input.periodoSuspensaoAte || "");

  const diaEncontroSemanalNum = DIAS_SEMANA_MAP[input.diaEncontroSemanal] ?? -1;
  const diaEncontroMensalNum = DIAS_SEMANA_MAP[input.diaEncontroMensal] ?? -1;
  const semanaEncontroMensalNum = SEMANA_MAP[input.semanaEncontroMensal] ?? -1;

  // Coletar feriados para todos os anos do contrato
  const todosOsFeriados: Date[] = [...input.feriados];
  for (
    let ano = dataAdmissao.getFullYear();
    ano <= dataTerminoContrato.getFullYear();
    ano++
  ) {
    todosOsFeriados.push(...getFeriadosNacionais(ano));
  }

  const horasDiarias = parseFloat(input.jornadaDiaria) || 4;

  // Iterar por todos os meses do contrato
  const meses: MesCalendario[] = [];
  let encontrosTeoria = 0;
  let encontrosPratica = 0;

  let mesAtual = new Date(
    dataAdmissao.getFullYear(),
    dataAdmissao.getMonth(),
    1,
  );
  const mesFinal = new Date(
    dataTerminoContrato.getFullYear(),
    dataTerminoContrato.getMonth(),
    1,
  );

  while (mesAtual <= mesFinal) {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); // 0=dom

    // Calcular encontro mensal deste mês
    let diaEncontroMensalDoMes: Date | null = null;
    if (diaEncontroMensalNum >= 0 && semanaEncontroMensalNum !== 0) {
      diaEncontroMensalDoMes = getNthWeekdayOfMonth(
        ano,
        mes,
        diaEncontroMensalNum,
        semanaEncontroMensalNum,
      );
    }

    // Construir as semanas
    const semanas: (DiaCalendario | null)[][] = [];
    let semanaAtual: (DiaCalendario | null)[] = [];

    // Preencher dias vazios no início
    for (let i = 0; i < primeiroDiaSemana; i++) {
      semanaAtual.push(null);
    }

    for (let d = 1; d <= diasNoMes; d++) {
      const date = new Date(ano, mes, d);
      let tipo: TipoDia;
      let label = "";

      const dentroDoContrato =
        date >= dataAdmissao && date <= dataTerminoContrato;

      if (!dentroDoContrato) {
        // Fora do período do contrato
        if (isFimDeSemana(date, input.folga)) {
          tipo = "finaldesemana";
        } else {
          tipo = "vazio";
        }
      } else if (isFimDeSemana(date, input.folga)) {
        tipo = "finaldesemana";
      } else if (
        suspensaoDe &&
        suspensaoAte &&
        inRange(date, suspensaoDe, suspensaoAte)
      ) {
        tipo = "suspensao";
        label = "S";
      } else if (
        (feriasDe && feriasAte && inRange(date, feriasDe, feriasAte)) ||
        (ferias2De && ferias2Ate && inRange(date, ferias2De, ferias2Ate))
      ) {
        tipo = "ferias";
        label = "Fe";
      } else if (isFeriado(date, todosOsFeriados)) {
        tipo = "feriado";
        label = "F";
      } else if (
        dataTerminoIntro &&
        date >= dataAdmissao &&
        date <= dataTerminoIntro
      ) {
        // Período introdutório
        tipo = "introducao";
        label = "I";
        encontrosTeoria++;
      } else if (dataTerminoIntro && date > dataTerminoIntro) {
        // Período pós-introdutório: semanal, mensal ou prática
        const inicioSemanalOk = !dataInicioSemanal || date >= dataInicioSemanal;

        if (
          diaEncontroMensalDoMes &&
          sameDay(date, diaEncontroMensalDoMes) &&
          inicioSemanalOk
        ) {
          tipo = "mensal";
          label = "M";
          encontrosTeoria++;
        } else if (
          diaEncontroSemanalNum >= 0 &&
          date.getDay() === diaEncontroSemanalNum &&
          inicioSemanalOk
        ) {
          tipo = "semanal";
          label = "T";
          encontrosTeoria++;
        } else {
          tipo = "pratica";
          label = "P";
          encontrosPratica++;
        }
      } else {
        // Sem período introdutório definido, tudo é prática
        tipo = "inactive";
      }

      const diaCalendario: DiaCalendario = { dia: d, tipo, label, date };
      semanaAtual.push(diaCalendario);

      if (semanaAtual.length === 7) {
        semanas.push(semanaAtual);
        semanaAtual = [];
      }
    }

    // Preencher dias vazios no final
    if (semanaAtual.length > 0) {
      while (semanaAtual.length < 7) {
        semanaAtual.push(null);
      }
      semanas.push(semanaAtual);
    }

    // Garantir 6 semanas para layout consistente
    while (semanas.length < 6) {
      semanas.push(Array(7).fill(null));
    }

    meses.push({
      ano,
      mes,
      nome: `${NOMES_MESES[mes]} ${ano}`,
      semanas,
    });

    // Próximo mês
    mesAtual = new Date(ano, mes + 1, 1);
  }

  // Calcular resumo
  const horasTeoria = encontrosTeoria * horasDiarias;
  const horasPratica = encontrosPratica * horasDiarias;
  const totalHoras = horasTeoria + horasPratica;
  const totalEncontros = encontrosTeoria + encontrosPratica;

  const porcentagemTeoria =
    totalHoras > 0 ? (horasTeoria / totalHoras) * 100 : 0;
  const porcentagemPratica =
    totalHoras > 0 ? (horasPratica / totalHoras) * 100 : 0;

  const formatDate = (d: Date) =>
    `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;

  return {
    meses,
    resumo: {
      encontrosTeoria,
      horasTeoria,
      porcentagemTeoria: Math.round(porcentagemTeoria * 100) / 100,
      encontrosPratica,
      horasPratica,
      porcentagemPratica: Math.round(porcentagemPratica * 100) / 100,
      totalEncontros,
      totalHoras,
      inicioFormacao: formatDate(dataAdmissao),
    },
    nomeAprendiz: input.nomeAprendiz,
    curso: input.curso,
    empresa: input.empresa,
    cargaHorariaDiaria: `${horasDiarias}H`,
    diaEncontroSemanal: input.diaEncontroSemanal,
    atividadeComplementar: `${input.diaEncontroMensal || ""} / ${input.semanaEncontroMensal || ""}`,
    introdutorios: dataTerminoIntro
      ? `${formatDate(dataAdmissao)} a ${formatDate(dataTerminoIntro)}`
      : "",
    duracaoContrato: `${formatDate(dataAdmissao)} a ${formatDate(dataTerminoContrato)}`,
  };
}
