export type TipoDia =
  | "introducao" 
  | "semanal" 
  | "mensal" 
  | "pratica" 
  | "feriado" 
  | "ferias" 
  | "suspensao" 
  | "finaldesemana" 
  | "inactive" 
  | "vazio"; 

export interface DiaCalendario {
  dia: number; 
  tipo: TipoDia;
  label: string; 
  date: Date;
}

export interface MesCalendario {
  ano: number;
  mes: number; 
  nome: string; 
  semanas: (DiaCalendario | null)[][]; 
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
  // detalhamento por tipo
  encontrosIntrodutorio: number;
  encontrosSemanal: number;
  encontrosMensal: number;
  dataTerminoContrato: string;
  dataInicioEmpresa: string;
  dataInicioEncontroSemanal: string;
  dataInicioEncontroFinais: string;
  diasTeoria: number;
  diasPratica: number;
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
  jornadaDiaria: string; 
  diasTeoria: string; 
  diasPratica: string; 
  dataAdmissao: string; 
  dataTerminoIntrodutorios: string; 
  diaEncontroSemanal: string; 
  dataInicioEncontroSemanal: string; 
  diaEncontroMensal: string; 
  semanaEncontroMensal: string; 
  folga: string; 
  feriados: Date[]; 
  periodoFeriasDe?: string;
  periodoFeriasAte?: string;
  periodoFerias2De?: string;
  periodoFerias2Ate?: string;
  periodoSuspensaoDe?: string;
  periodoSuspensaoAte?: string;
}

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

export function getFeriadosNacionais(ano: number): Date[] {
  const feriados: Date[] = [
    new Date(ano, 0, 1), 
    new Date(ano, 3, 21), 
    new Date(ano, 4, 1), 
    new Date(ano, 8, 7), 
    new Date(ano, 9, 12), 
    new Date(ano, 10, 2), 
    new Date(ano, 10, 15), 
    new Date(ano, 11, 25), 
  ];
  const pascoa = calcularPascoa(ano);
  feriados.push(pascoa);
  const sextaSanta = new Date(pascoa);
  sextaSanta.setDate(sextaSanta.getDate() - 2);
  feriados.push(sextaSanta);
  const carnaval = new Date(pascoa);
  carnaval.setDate(carnaval.getDate() - 48); 
  feriados.push(carnaval);
  const tercaCarnaval = new Date(pascoa);
  tercaCarnaval.setDate(tercaCarnaval.getDate() - 47); 
  feriados.push(tercaCarnaval);
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
      return dow === 0 || dow === 6;
  }
}

function getNthWeekdayOfMonth(
  ano: number,
  mes: number,
  diaSemana: number,
  n: number,
): Date | null {
  if (n === -1) {
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

export function gerarCalendario(input: CalendarioInput): CalendarioGerado {
  const dataAdmissao = parseDate(input.dataAdmissao)!;
  const dataTerminoIntro = parseDate(input.dataTerminoIntrodutorios);
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
  
  const todosOsFeriados: Date[] = [...input.feriados];
  const anoBase = dataAdmissao.getFullYear();
  for (let ano = anoBase; ano <= anoBase + 5; ano++) {
    todosOsFeriados.push(...getFeriadosNacionais(ano));
  }

  const horasDiarias = parseFloat(input.jornadaDiaria) || 4;
  const dTeoriaTarget = parseInt(input.diasTeoria) || 0;
  const dPraticaTarget = parseInt(input.diasPratica) || 0;

  const meses: MesCalendario[] = [];
  let encontrosTeoria = 0;
  let encontrosPratica = 0;
  let encontrosIntrodutorio = 0;
  let encontrosSemanal = 0;
  let encontrosMensal = 0;
  let primeiraDataSemanal: Date | null = null;
  let primeiraDataMensal: Date | null = null;
  let primeiraDataEmpresa: Date | null = null;
  let dataAtualParaLoop = new Date(dataAdmissao.getFullYear(), dataAdmissao.getMonth(), 1);
  let dataTerminoReal = new Date(dataAdmissao);

  const dataMax = new Date(dataAdmissao);
  dataMax.setFullYear(dataMax.getFullYear() + 10);

  while (
    (encontrosTeoria < dTeoriaTarget || encontrosPratica < dPraticaTarget) &&
    dataAtualParaLoop < dataMax
  ) {
    const ano = dataAtualParaLoop.getFullYear();
    const mes = dataAtualParaLoop.getMonth();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    let diaEncontroMensalDoMes: Date | null = null;

    if (diaEncontroMensalNum >= 0 && semanaEncontroMensalNum !== 0) {
      diaEncontroMensalDoMes = getNthWeekdayOfMonth(
        ano,
        mes,
        diaEncontroMensalNum,
        semanaEncontroMensalNum,
      );
    }

    const semanas: (DiaCalendario | null)[][] = [];
    let semanaAtual: (DiaCalendario | null)[] = [];

    for (let i = 0; i < primeiroDiaSemana; i++) {
      semanaAtual.push(null);
    }

    for (let d = 1; d <= diasNoMes; d++) {
      const date = new Date(ano, mes, d);
      let tipo: TipoDia = "vazio";
      let label = "";

      const jaConcluiuTudo = encontrosTeoria >= dTeoriaTarget && encontrosPratica >= dPraticaTarget;
      const ehDiaValido = date >= dataAdmissao && !jaConcluiuTudo;

      if (!ehDiaValido) {
        if (isFimDeSemana(date, input.folga)) {
          tipo = "finaldesemana";
        } else {
          tipo = jaConcluiuTudo ? "inactive" : "vazio";
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
      } else {
        const isIntro = dataTerminoIntro && date >= dataAdmissao && date <= dataTerminoIntro;
        const inicioSemanalOk = !dataInicioSemanal || date >= dataInicioSemanal;
        const isMensal = diaEncontroMensalDoMes && sameDay(date, diaEncontroMensalDoMes) && inicioSemanalOk;
        const isSemanal = diaEncontroSemanalNum >= 0 && date.getDay() === diaEncontroSemanalNum && inicioSemanalOk;

        if (isIntro && encontrosTeoria < dTeoriaTarget) {
          tipo = "introducao";
          label = "I";
          encontrosTeoria++;
          encontrosIntrodutorio++;
        } else if (isMensal && encontrosTeoria < dTeoriaTarget) {
          tipo = "mensal";
          label = "M";
          encontrosTeoria++;
          encontrosMensal++;
          if (!primeiraDataMensal) primeiraDataMensal = new Date(date);
        } else if (isSemanal && encontrosTeoria < dTeoriaTarget) {
          tipo = "semanal";
          label = "T";
          encontrosTeoria++;
          encontrosSemanal++;
          if (!primeiraDataSemanal) primeiraDataSemanal = new Date(date);
        } else if (encontrosPratica < dPraticaTarget) {
          tipo = "pratica";
          label = "P";
          encontrosPratica++;
          if (!primeiraDataEmpresa && !isIntro) primeiraDataEmpresa = new Date(date);
        } else if (encontrosTeoria < dTeoriaTarget) {
          tipo = "introducao";
          label = "I";
          encontrosTeoria++;
          encontrosIntrodutorio++;
        } else {
          tipo = "inactive";
        }

        if (tipo !== "inactive") {
          dataTerminoReal = new Date(date);
        }
      }

      const diaCalendario: DiaCalendario = { dia: d, tipo, label, date };
      semanaAtual.push(diaCalendario);
      if (semanaAtual.length === 7) {
        semanas.push(semanaAtual);
        semanaAtual = [];
      }
    }
    if (semanaAtual.length > 0) {
      while (semanaAtual.length < 7) {
        semanaAtual.push(null);
      }
      semanas.push(semanaAtual);
    }
    while (semanas.length < 6) {
      semanas.push(Array(7).fill(null));
    }
    meses.push({
      ano,
      mes,
      nome: `${NOMES_MESES[mes]} ${ano}`,
      semanas,
    });
    dataAtualParaLoop = new Date(ano, mes + 1, 1);
  }

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
    
  // Data de início na empresa: dia seguinte ao término introdutório (pula fim de semana)
  let dataInicioEmpresaCalc = dataTerminoIntro ? new Date(dataTerminoIntro) : null;
  if (dataInicioEmpresaCalc) {
    dataInicioEmpresaCalc.setDate(dataInicioEmpresaCalc.getDate() + 1);
    while (isFimDeSemana(dataInicioEmpresaCalc, input.folga)) {
      dataInicioEmpresaCalc.setDate(dataInicioEmpresaCalc.getDate() + 1);
    }
  }

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
      encontrosIntrodutorio,
      encontrosSemanal,
      encontrosMensal,
      dataTerminoContrato: formatDate(dataTerminoReal),
      dataInicioEmpresa: dataInicioEmpresaCalc ? formatDate(dataInicioEmpresaCalc) : "",
      dataInicioEncontroSemanal: primeiraDataSemanal ? formatDate(primeiraDataSemanal) : "",
      dataInicioEncontroFinais: primeiraDataMensal ? formatDate(primeiraDataMensal) : "",
      diasTeoria: dTeoriaTarget,
      diasPratica: dPraticaTarget,
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
    duracaoContrato: `${formatDate(dataAdmissao)} a ${formatDate(dataTerminoReal)}`,
  };
}