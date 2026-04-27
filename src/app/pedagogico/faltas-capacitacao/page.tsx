"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { X, Check } from "lucide-react";
import api from "@/services/api";

// Mapeamento TurDiaSemana: convenção MySQL DAYOFWEEK (1=Dom, 2=Seg, ..., 7=Sáb)
// → JS Date.getDay() (0=Dom, 1=Seg, ..., 6=Sáb)
function mysqlDiaToJsDay(dia: string): number {
  return (Number(dia) - 1) % 7;
}

function gerarDatasProximas3Semanas(dias: string[]): string[] {
  const jsDays = dias.filter(Boolean).map(mysqlDiaToJsDay);
  if (jsDays.length === 0) return [];
  const datas: string[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  for (let i = 0; i <= 21; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    if (jsDays.includes(d.getDay())) {
      datas.push(d.toISOString().substring(0, 10));
    }
  }
  return datas;
}

const TURMAS_ENC: { cod: number; nome: string }[] = [
  { cod: 21, nome: "35º A-T-OSASCO" }, { cod: 22, nome: "35º A-M-OSASCO" },
  { cod: 24, nome: "35º A-JANDIRA" }, { cod: 25, nome: "35º A-T-SANTANA" },
  { cod: 26, nome: "35º A-PIRAPORA" }, { cod: 27, nome: "35º A-M-SANTANA" },
  { cod: 28, nome: "35º B-M-BARUERI" }, { cod: 29, nome: "35º B-T-BARUERI" },
  { cod: 30, nome: "35º A-M-BARUERI" }, { cod: 31, nome: "35º A-T-BARUERI" },
  { cod: 33, nome: "35º M-SEMEADOR" }, { cod: 34, nome: "35º T-SEMEADOR" },
  { cod: 35, nome: "35º B-JANDIRA" }, { cod: 36, nome: "35ºB-M-Osasco" },
  { cod: 38, nome: "35ºB-T-Osasco" }, { cod: 40, nome: "36ª A- M-Santana" },
  { cod: 41, nome: "36ª A- M- ETEC" }, { cod: 42, nome: "36ª B- M- ETEC" },
  { cod: 43, nome: "36ª C- M- ETEC" }, { cod: 44, nome: "36ª D- M- ETEC" },
  { cod: 45, nome: "36ª- M- Barueri" }, { cod: 46, nome: "36ª-T- Barueri" },
  { cod: 47, nome: "36ª-M- Adjacentes" }, { cod: 48, nome: "36ª-T- Adjacentes" },
  { cod: 49, nome: "36ª A- Jandira" }, { cod: 50, nome: "36ªA-T- Osasco" },
  { cod: 52, nome: "36ªA-M- Osasco" }, { cod: 53, nome: "36ª-T- Semeador" },
  { cod: 54, nome: "36ª-M- Semeador" }, { cod: 55, nome: "36º B-M-OSASCO" },
  { cod: 58, nome: "36º B-T-OSASCO" }, { cod: 59, nome: "36ª Pirapora" },
  { cod: 64, nome: "37º A-M-BARUERI" }, { cod: 65, nome: "37º A-T-BARUERI" },
  { cod: 66, nome: "37º A- Jandira" }, { cod: 68, nome: "37º A-M-Osasco" },
  { cod: 69, nome: "37º A-T-Osasco" }, { cod: 70, nome: "37ª A- M- ETEC" },
  { cod: 71, nome: "37ª A- T- ETEC" }, { cod: 72, nome: "37ª Pirapora" },
  { cod: 73, nome: "37ª M- Semeador" }, { cod: 75, nome: "37ª T- Semeador" },
  { cod: 76, nome: "37ª B- M- ETEC" }, { cod: 77, nome: "37ª B- T- ETEC" },
  { cod: 78, nome: "37ª M- IOS" }, { cod: 79, nome: "37ª T- IOS" },
  { cod: 80, nome: "37º B-M-Osasco" }, { cod: 81, nome: "37º B-T-Osasco" },
  { cod: 82, nome: "37ª M- Santana" }, { cod: 83, nome: "38º M-SEMEADOR" },
  { cod: 85, nome: "38º A-Osasco M" }, { cod: 86, nome: "38º A- OSASCO T" },
  { cod: 88, nome: "38ª D- T- ETEC" }, { cod: 89, nome: "38ª A- M- ETEC" },
  { cod: 90, nome: "38° Barueri M" }, { cod: 91, nome: "38° Barueri T" },
  { cod: 92, nome: "38ª B- M- ETEC" }, { cod: 93, nome: "38ª C- T- ETEC" },
  { cod: 94, nome: "38º M-Santana" }, { cod: 95, nome: "38º T- SEMEADOR" },
  { cod: 96, nome: "38º B- OSASCO T" }, { cod: 97, nome: "38º B- OSASCO M" },
  { cod: 98, nome: "38º Pirapora" }, { cod: 99, nome: "38° M- IOS" },
  { cod: 100, nome: "38° T- IOS" }, { cod: 103, nome: "39ª A-Osasco-Manhã" },
  { cod: 104, nome: "39ª B-Osasco-Manhã" }, { cod: 105, nome: "39ª A-Osasco-Tarde" },
  { cod: 106, nome: "39ª B-Osasco-Tarde" }, { cod: 107, nome: "39ª A-Barueri-Manhã" },
  { cod: 108, nome: "39ª B-Barueri-Manhã" }, { cod: 109, nome: "39ª A-Barueri-Tarde" },
  { cod: 110, nome: "39ª B-Barueri-Tarde" }, { cod: 111, nome: "39ª B-ETEC-Manhã" },
  { cod: 112, nome: "39ª A-ETEC-Manhã" }, { cod: 113, nome: "39ª A-ETEC-Tarde" },
  { cod: 114, nome: "39ª B-ETEC-Tarde" }, { cod: 115, nome: "39ª Pirapora" },
  { cod: 118, nome: "39ª A-Santana-Manhã" }, { cod: 119, nome: "39ª B-Santana-Manhã" },
  { cod: 122, nome: "39ª Semeador-Tarde" }, { cod: 123, nome: "39ª Semeador-Manhã" },
  { cod: 124, nome: "39ª A-IOS-Manhã" }, { cod: 125, nome: "39ª B-IOS-Manhã" },
  { cod: 126, nome: "39ª A-IOS-Tarde" }, { cod: 127, nome: "39ª B-IOS-Tarde" },
  { cod: 128, nome: "40ª A-Barueri-Manhã" }, { cod: 129, nome: "40ª B-Barueri-Manhã" },
  { cod: 130, nome: "40ª A-Barueri-Tarde" }, { cod: 131, nome: "40ª B-Barueri-Tarde" },
  { cod: 132, nome: "40ª A-Osasco-Manhã" }, { cod: 133, nome: "40ª B-Osasco-Manhã" },
  { cod: 134, nome: "40ª A-Osasco-Tarde" }, { cod: 135, nome: "40ª B-Osasco-Tarde" },
  { cod: 136, nome: "40ª A-ETEC-Manhã" }, { cod: 137, nome: "40ª B-ETEC-Manhã" },
  { cod: 139, nome: "40ª A-ETEC-Tarde" }, { cod: 141, nome: "40ª B-ETEC-Tarde" },
  { cod: 142, nome: "40ª Pirapora" }, { cod: 143, nome: "40ª A-Santana-Manhã" },
  { cod: 144, nome: "40ª B-Santana-Manhã" }, { cod: 145, nome: "40ª A-Santana-Tarde" },
  { cod: 146, nome: "40ª B-Santana-Tarde" }, { cod: 149, nome: "40ª Semeador-Manhã" },
  { cod: 150, nome: "40ª Semeador-Tarde" }, { cod: 151, nome: "40ª IOS-Manhã" },
  { cod: 152, nome: "40ª IOS-Tarde" }, { cod: 153, nome: "41º -A-Osasco-Manhã" },
  { cod: 154, nome: "41º -B-Osasco-Tarde" }, { cod: 155, nome: "41º -A-Osasco-Tarde" },
  { cod: 156, nome: "41º -B-Osasco-Manhã" }, { cod: 157, nome: "41º-A-ETEC-Manhã" },
  { cod: 158, nome: "41º-A-ETEC-Tarde" }, { cod: 160, nome: "41ºA Semeador Manhã" },
  { cod: 161, nome: "41ºA Semeador Tarde" }, { cod: 162, nome: "41ºA-Santana-Manhã" },
  { cod: 163, nome: "41ºA-Santana-Tarde" }, { cod: 164, nome: "41º Pirapora" },
  { cod: 165, nome: "41ºA-Barueri-Manhã" }, { cod: 166, nome: "41ºA-Barueri-Tarde" },
  { cod: 168, nome: "41º IOS - Manhã" }, { cod: 169, nome: "41º IOS - Tarde" },
  { cod: 170, nome: "42º -A-Osasco-Manha" }, { cod: 171, nome: "42º -A-Osasco-Tarde" },
  { cod: 173, nome: "42º-B-Osasco-Manha" }, { cod: 174, nome: "42º-B-Osasco-Tarde" },
  { cod: 175, nome: "42º-A-Manha-Santana" }, { cod: 176, nome: "42º-A-Tarde-Santana" },
  { cod: 177, nome: "42º-Manha-Etec" }, { cod: 178, nome: "42º-Tarde-Etec" },
  { cod: 179, nome: "42º-Manha-SEMEADOR" }, { cod: 180, nome: "42º-Tarde-SEMEADOR" },
  { cod: 181, nome: "42º-Manha-Pirapora" }, { cod: 183, nome: "42º-Manha-Barueri" },
  { cod: 184, nome: "42º-Tarde-Barueri" }, { cod: 185, nome: "42º IOS - Manhã - A" },
  { cod: 186, nome: "42º IOS - Manhã - B" }, { cod: 187, nome: "42º IOS - Tarde - A" },
  { cod: 188, nome: "42º IOS - Tarde - B" }, { cod: 190, nome: "43º Santana - Manhã" },
  { cod: 191, nome: "43º Santana - Tarde" }, { cod: 192, nome: "43º Etec - Manhã" },
  { cod: 193, nome: "43º Etec - Tarde" }, { cod: 194, nome: "43º Semeador - Manhã" },
  { cod: 195, nome: "43º Semeador - Tarde" }, { cod: 196, nome: "43º Pirapora - Manhã" },
  { cod: 197, nome: "43º Osasco - Manhã A" }, { cod: 198, nome: "43º Osasco - Tarde A" },
  { cod: 199, nome: "43º Osasco - Manhã B" }, { cod: 200, nome: "43º Osasco - Tarde B" },
  { cod: 202, nome: "43º IOS A MANHÃ" }, { cod: 203, nome: "43º IOS B MANHÃ" },
  { cod: 204, nome: "43º IOS A TARDE" }, { cod: 205, nome: "43º IOS B TARDE" },
  { cod: 207, nome: "44º Semeador - Manhã" }, { cod: 209, nome: "44º Osasco - Manhã A" },
  { cod: 211, nome: "44º Semeador - Tarde" }, { cod: 212, nome: "44º Osasco - Manhã B" },
  { cod: 213, nome: "43º-Manha-Barueri" }, { cod: 214, nome: "44º Osasco - Tarde A" },
  { cod: 215, nome: "44º Osasco - Tarde B" }, { cod: 216, nome: "43º-Tarde-Barueri" },
  { cod: 217, nome: "44º Santana - Manhã" }, { cod: 218, nome: "44º Santana - Tarde" },
  { cod: 220, nome: "44º Pirapora - Manhã" }, { cod: 221, nome: "44º Etec - Manhã" },
  { cod: 222, nome: "44º Etec - Tarde" }, { cod: 223, nome: "44º IOS A MANHÃ" },
  { cod: 224, nome: "44º IOS B MANHÃ" }, { cod: 225, nome: "44º IOS A TARDE" },
  { cod: 226, nome: "44º IOS B TARDE" }, { cod: 228, nome: "45° IOS A MANHÃ" },
  { cod: 229, nome: "45º -A-Osasco-Manhã" }, { cod: 230, nome: "45º -B-Osasco-Manhã" },
  { cod: 231, nome: "45º -C-Osasco-Manhã" }, { cod: 232, nome: "45º -D-Osasco-Manhã" },
  { cod: 233, nome: "45º -A-Osasco-Tarde" }, { cod: 234, nome: "45º -B-Osasco-Tarde" },
  { cod: 235, nome: "45º -C-Osasco-Tarde" }, { cod: 236, nome: "45º -D-Osasco-Tarde" },
  { cod: 237, nome: "44º-Barueri-Manhã PR" }, { cod: 238, nome: "44º-Barueri-Manhã SP" },
  { cod: 239, nome: "44º-Barueri-Tarde PR" }, { cod: 240, nome: "44º-Barueri-Tarde SP" },
  { cod: 242, nome: "45º Santana-Manhã A" }, { cod: 243, nome: "45º Santana-Tarde A" },
  { cod: 244, nome: "45º Santana-Manhã B" }, { cod: 245, nome: "45º Santana-Tarde B" },
  { cod: 246, nome: "45º Pirapora - Manhã" }, { cod: 247, nome: "46° IOS Manhã" },
  { cod: 248, nome: "46° IOS Tarde" }, { cod: 277, nome: "46º A-Osasco-Manhã" },
  { cod: 278, nome: "46º B-Osasco-Manhã" }, { cod: 279, nome: "46º A-Osasco-Tarde" },
  { cod: 280, nome: "46º B-Osasco-Tarde" }, { cod: 281, nome: "45º-Barueri-Manhã PR" },
  { cod: 282, nome: "45º-Barueri-Manhã SP" }, { cod: 283, nome: "45º-Barueri-Tarde PR" },
  { cod: 285, nome: "45º-Barueri-Tarde SP" }, { cod: 286, nome: "46º Santana-Manhã A" },
  { cod: 287, nome: "46º Santana-Manhã B" }, { cod: 288, nome: "46º Santana-Tarde A" },
  { cod: 289, nome: "46º Santana-Tarde B" }, { cod: 290, nome: "46º Pirapora - Manhã" },
  { cod: 291, nome: "46º Pirapora - Tarde" }, { cod: 298, nome: "47° IOS Manhã A" },
  { cod: 299, nome: "47° IOS Manhã B" }, { cod: 300, nome: "47° IOS Tarde A" },
  { cod: 301, nome: "47° IOS Tarde B" }, { cod: 302, nome: "47º Santana-Manhã A" },
  { cod: 303, nome: "47º Santana-Manhã B" }, { cod: 304, nome: "47º Santana-Tarde A" },
  { cod: 305, nome: "47º Santana-Tarde B" }, { cod: 309, nome: "47º Pirapora - Tarde" },
  { cod: 310, nome: "47º Pirapora - Manhã" }, { cod: 311, nome: "47º A-Osasco-manhã" },
  { cod: 312, nome: "47º B-Osasco-manhã" }, { cod: 313, nome: "47º A-Osasco-tarde" },
  { cod: 314, nome: "47º B-Osasco-tarde" }, { cod: 315, nome: "46º Barueri-manhã" },
  { cod: 317, nome: "46º Barueri-tarde" }, { cod: 319, nome: "48º Santana-Manha A" },
  { cod: 320, nome: "48º Santana tarde  B" }, { cod: 321, nome: "48º Semeador - Manhã" },
  { cod: 322, nome: "48º Semeador - tarde" }, { cod: 323, nome: "48° IOS Manhã A" },
  { cod: 324, nome: "48° IOS Tarde B" }, { cod: 337, nome: "49º Semeador - manhã" },
  { cod: 338, nome: "49º Semeador - tarde" }, { cod: 340, nome: "49a Santana manhã" },
  { cod: 341, nome: "49a Santana tarde" }, { cod: 349, nome: "48ª Pirapora - Manhã" },
  { cod: 351, nome: "48ª Pirapora - Tarde" }, { cod: 353, nome: "50a Santana tarde" },
  { cod: 354, nome: "50º Semeador - manhã" }, { cod: 355, nome: "50º Semeador - tarde" },
  { cod: 356, nome: "48º -Osasco-manhã" }, { cod: 357, nome: "48º -Osasco-tarde" },
  { cod: 358, nome: "49° IOS Manhã A" }, { cod: 359, nome: "49° IOS  TARDE" },
  { cod: 362, nome: "51º Semeador - manhã" }, { cod: 363, nome: "51º Semeador - tarde" },
  { cod: 364, nome: "51º Santana - tarde" }, { cod: 365, nome: "50° IOS Manhã A" },
  { cod: 366, nome: "50° IOS Tarde A" }, { cod: 367, nome: "48º -Osasco-tarde" },
  { cod: 369, nome: "49º -Osasco-manhã" }, { cod: 370, nome: "49º -Osasco-tarde" },
  { cod: 378, nome: "47º Barueri-T/C e D" }, { cod: 380, nome: "47º Barueri-M A e B" },
  { cod: 381, nome: "49ª Pirapora  Manhã" }, { cod: 382, nome: "49ª Pirapora  tarde" },
  { cod: 400, nome: "50ª Pirapora manhã" }, { cod: 401, nome: "50ª Pirapora tarde" },
  { cod: 402, nome: "52º Semeador - Manhã" }, { cod: 408, nome: "50º - Osasco - manhã" },
  { cod: 409, nome: "50º - Osasco - tarde" }, { cod: 410, nome: "52º Santana - Tarde" },
  { cod: 411, nome: "53º Santana - Tarde" }, { cod: 417, nome: "51ª Pirapora manhã" },
  { cod: 418, nome: "51ª Pirapora tarde" }, { cod: 419, nome: "53º Santana - Manhã" },
  { cod: 422, nome: "48º BARUERI - MANHÃ" }, { cod: 423, nome: "48º BARUERI - TARDE" },
  { cod: 424, nome: "53º Semeador - Manhã" }, { cod: 425, nome: "51° IOS Manhã 2023-2" },
  { cod: 426, nome: "51° IOS Tarde 2023-2" }, { cod: 427, nome: "52° IOS Manhã 2024-1" },
  { cod: 428, nome: "52° IOS Tarde 2024-1" }, { cod: 429, nome: "51º A-M-OSASCO" },
  { cod: 430, nome: "51º B-M-OSASCO" }, { cod: 431, nome: "51º A-T-OSASCO" },
  { cod: 432, nome: "51º B-T-OSASCO" }, { cod: 433, nome: "52ª Osasco A- Manhã" },
  { cod: 434, nome: "52ª  Osasco B Tarde" }, { cod: 435, nome: "52ª  Osasco B. Manhã" },
  { cod: 436, nome: "52ª Osasco A -Tarde" }, { cod: 442, nome: "52ª Castanheiras" },
  { cod: 443, nome: "54ºSemeador Manhã" }, { cod: 444, nome: "54ºSemeador Tarde" },
  { cod: 446, nome: "54 º Santana Manhã" }, { cod: 447, nome: "54 º Santana Tarde" },
  { cod: 448, nome: "52ª Pirapora Manhã" }, { cod: 449, nome: "52ª Pirapora Tarde" },
  { cod: 450, nome: "55ªSemeador -Manhã" }, { cod: 451, nome: "55ªSemeador Tarde" },
  { cod: 452, nome: "55ª Santana  Tarde" }, { cod: 453, nome: "53° IOS Manhã 2024-2" },
  { cod: 454, nome: "53° IOS Tarde 2024-2" }, { cod: 456, nome: "56ª Santana Manhã" },
  { cod: 457, nome: "56ª Santana Tarde" }, { cod: 458, nome: "56ª Semeador Manhã" },
  { cod: 459, nome: "56ª Semeador Tarde" }, { cod: 460, nome: "49º BARUERI - MANHÃ" },
  { cod: 461, nome: "49° BARUERI - TARDE" }, { cod: 462, nome: "53ª Osasco Manhã A" },
  { cod: 463, nome: "53ª Osasco Manhã B" }, { cod: 464, nome: "53ª  Osasco C Tarde" },
  { cod: 465, nome: "52ª  Osasco D Tarde" }, { cod: 466, nome: "Ignorar" },
  { cod: 467, nome: "53ª Osasco Tarde D" }, { cod: 470, nome: "01-BARUERI-CAP MANHA" },
  { cod: 476, nome: "02-BARUERI-CAP MANHA" }, { cod: 477, nome: "02-BARUERI-CAP TARDE" },
  { cod: 478, nome: "01-BARUERI-CAP-TARDE" }, { cod: 479, nome: "57ª Santana Tarde" },
  { cod: 480, nome: "57ª Semeador - Manhã" }, { cod: 481, nome: "57ªSemeador - Tarde" },
  { cod: 482, nome: "57ª Santana Manhã" }, { cod: 483, nome: "4ª Cooperforte 2025" },
  { cod: 484, nome: "03-BARUERI-CAP-MANHA" }, { cod: 498, nome: "58º Santana Centro" },
  { cod: 499, nome: "58º Semeador - Manhã" }, { cod: 502, nome: "58° Semeador Tarde" },
  { cod: 503, nome: "54ª Osasco Manha" }, { cod: 504, nome: "54ª Osasco Tarde" },
  { cod: 507, nome: "05-BARUERI-CAP MANHA" }, { cod: 513, nome: "50° BARUERI – MANHÃ" },
  { cod: 514, nome: "50° BARUERI – TARDE" }, { cod: 515, nome: "59º Fazendinha Manhã" },
  { cod: 516, nome: "59º Fazendinha Tarde" }, { cod: 517, nome: "59ªSantana Centro Mª" },
  { cod: 518, nome: "59ª Santana Centro T" }, { cod: 519, nome: "Osasco-55 manhã" },
  { cod: 520, nome: "Osasco 55-tarde" }, { cod: 521, nome: "Osasco 55-tarde" },
  { cod: 522, nome: "06-Barueri-Cap manhã" }, { cod: 523, nome: "06-BARUERI-Cap tarde" },
];

const PRESENCA_OPTIONS = ["F", "J", "L", "S", "D", "P", "N"];

interface Aprendiz {
  Apr_Codigo: number;
  Apr_Nome: string;
}

interface Presenca {
  AcpAprendiz: number;
  AcpPresenca: string | null;
}

interface TurmaInfo {
  TurCodigo: number;
  TurNome: string | null;
  TurCurso: string | null;
  CurDescricao: string | null;
  TurDiaSemana: string | null;
  TurDiaSemana02: string | null;
}

export default function FaltasCapacitacaoPage() {
  // ── estado principal ──────────────────────────────────────────────────────
  const [turma, setTurma]         = useState("");
  const [data, setData]           = useState("");
  const [datas, setDatas]         = useState<string[]>([]);
  const [aprendizes, setAprendizes] = useState<Aprendiz[]>([]);
  const [presencas, setPresencas] = useState<Record<number, string>>({});
  const [loadingDatas, setLoadingDatas]       = useState(false);
  const [loadingTabela, setLoadingTabela]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");

  // ── estado lançar conteúdo ────────────────────────────────────────────────
  const [showLancar, setShowLancar]       = useState(false);
  const [lcTurma, setLcTurma]             = useState("");
  const [lcDisciplina, setLcDisciplina]   = useState("");
  const [lcData, setLcData]               = useState("");
  const [lcDatas, setLcDatas]             = useState<string[]>([]);
  const [lcTurmaInfo, setLcTurmaInfo]     = useState<TurmaInfo | null>(null);
  const [lcLancando, setLcLancando]       = useState(false);

  // ── carregar datas ao selecionar turma ───────────────────────────────────
  useEffect(() => {
    if (!turma) { setDatas([]); setData(""); return; }
    setLoadingDatas(true);
    api.get(`/faltas-capacitacao/datas?turma=${turma}`)
      .then(r => { setDatas(Array.isArray(r.data) ? r.data : []); setData(""); })
      .catch(() => toast.error("Erro ao carregar datas."))
      .finally(() => setLoadingDatas(false));
  }, [turma]);

  // ── carregar aprendizes + presenças ao selecionar data ───────────────────
  const loadTabela = useCallback(async (t: string, d: string) => {
    if (!t || !d) return;
    setLoadingTabela(true);
    try {
      const [resApr, resPres] = await Promise.all([
        api.get(`/faltas-capacitacao/aprendizes?turma=${t}`),
        api.get(`/faltas-capacitacao/presencas?turma=${t}&data=${d}`),
      ]);
      const aprs: Aprendiz[] = Array.isArray(resApr.data) ? resApr.data : [];
      const pres: Presenca[] = Array.isArray(resPres.data) ? resPres.data : [];
      const map: Record<number, string> = {};
      pres.forEach(p => { if (p.AcpPresenca) map[p.AcpAprendiz] = p.AcpPresenca; });
      setAprendizes(aprs);
      setPresencas(map);
    } catch {
      toast.error("Erro ao carregar tabela.");
    } finally {
      setLoadingTabela(false);
    }
  }, []);

  useEffect(() => { loadTabela(turma, data); }, [turma, data, loadTabela]);

  // ── salvar presenças ──────────────────────────────────────────────────────
  const handleSalvar = async () => {
    if (!turma || !data) { toast.error("Selecione a turma e a data."); return; }
    setSaving(true);
    try {
      const registros = aprendizes.map(a => ({
        aprendiz: a.Apr_Codigo,
        turma:    Number(turma),
        data,
        presenca: presencas[a.Apr_Codigo] ?? null,
      }));
      await api.post("/faltas-capacitacao/presencas", { registros });
      toast.success("Presenças salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar presenças.");
    } finally {
      setSaving(false);
    }
  };

  // ── lançar conteúdo: buscar info da turma ────────────────────────────────
  useEffect(() => {
    if (!lcTurma) { setLcTurmaInfo(null); setLcDatas([]); setLcData(""); setLcDisciplina(""); return; }
    api.get(`/faltas-capacitacao/turma-info/${lcTurma}`)
      .then(r => {
        const info: TurmaInfo = r.data;
        setLcTurmaInfo(info);
        setLcDisciplina(info.CurDescricao ?? info.TurCurso ?? "");
        const dias = [info.TurDiaSemana, info.TurDiaSemana02].filter(Boolean) as string[];
        setLcDatas(gerarDatasProximas3Semanas(dias));
        setLcData("");
      })
      .catch(() => toast.error("Erro ao carregar dados da turma."));
  }, [lcTurma]);

  const handleLancarAula = async () => {
    if (!lcTurma || !lcData) { toast.error("Selecione a turma e a data."); return; }
    setLcLancando(true);
    try {
      const res = await api.post("/faltas-capacitacao/lancar-aula", {
        turma: Number(lcTurma),
        data:  lcData,
      });
      toast.success(`Aula lançada para ${res.data.count} aprendiz(es).`);
      setShowLancar(false);
      // Atualiza datas se for a mesma turma
      if (lcTurma === turma) {
        const r = await api.get(`/faltas-capacitacao/datas?turma=${turma}`);
        setDatas(Array.isArray(r.data) ? r.data : []);
      }
    } catch {
      toast.error("Erro ao lançar aula.");
    } finally {
      setLcLancando(false);
    }
  };

  const aprendizesFiltrados = aprendizes.filter(a =>
    a.Apr_Nome.toLowerCase().includes(search.toLowerCase())
  );

  const sel = "border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86] bg-white";

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <main className="flex-1 flex flex-col p-6 overflow-auto bg-gray-100">

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-[#133c86]">Faltas Capacitação</h1>
            <p className="text-gray-500 mt-1">Lançamento de presenças e faltas por turma e data</p>
          </div>
          <button
            onClick={() => setShowLancar(true)}
            className="px-5 py-2.5 bg-[#133c86] text-white font-semibold rounded-lg hover:bg-[#0f2e6b] transition-all shadow-md text-sm"
          >
            Lançar Conteúdo
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Turma</label>
              <select value={turma} onChange={e => setTurma(e.target.value)} className={`${sel} w-72`}>
                <option value="">Selecione..</option>
                {TURMAS_ENC.map(t => <option key={t.cod} value={t.cod}>{t.nome}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
              <select value={data} onChange={e => setData(e.target.value)} disabled={!turma || loadingDatas} className={`${sel} w-52`}>
                <option value="">{loadingDatas ? "Carregando..." : "Selecione.."}</option>
                {datas.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button
              onClick={handleSalvar}
              disabled={saving || !turma || !data}
              className="px-5 py-2 bg-[#133c86] text-white font-semibold rounded-lg hover:bg-[#0f2e6b] transition-all text-sm disabled:opacity-40 flex items-center gap-2"
            >
              <Check size={15} /> {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            <span className="font-bold">Legenda:</span>{" "}
            F – Falta.&nbsp;&nbsp;J – Falta Justificada.&nbsp;&nbsp;L – Licença Maternidade.&nbsp;&nbsp;
            S – Serviço Militar.&nbsp;&nbsp;D – Desligado.&nbsp;&nbsp;P – Presença.&nbsp;&nbsp;N – Não Atividade
          </p>
        </div>

        {/* Tabela de presenças */}
        {turma && data && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-end p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Procurar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-[#133c86]/30"
              />
            </div>
            {loadingTabela ? (
              <p className="text-center text-gray-400 text-sm py-10">Carregando...</p>
            ) : aprendizesFiltrados.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">
                {aprendizes.length === 0 ? "Nenhum aprendiz cadastrado nesta turma." : "Nenhum resultado para a busca."}
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Aluno</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase w-40">Presença</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {aprendizesFiltrados.map(a => (
                    <tr key={a.Apr_Codigo} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-2 text-gray-800 font-medium">{a.Apr_Nome}</td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          maxLength={1}
                          value={presencas[a.Apr_Codigo] ?? ""}
                          onChange={e => {
                            const v = e.target.value.toUpperCase();
                            if (v === "" || PRESENCA_OPTIONS.includes(v)) {
                              setPresencas(prev => ({ ...prev, [a.Apr_Codigo]: v }));
                            }
                          }}
                          className="border border-gray-300 rounded px-2 py-1 w-16 text-center text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Modal Lançar Conteúdo */}
        {showLancar && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-[#133c86]">Lançar Conteúdo</h2>
                <button onClick={() => setShowLancar(false)} className="text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Turma</label>
                  <select value={lcTurma} onChange={e => setLcTurma(e.target.value)} className={`${sel} w-full`}>
                    <option value="">Selecione..</option>
                    {TURMAS_ENC.map(t => <option key={t.cod} value={t.cod}>{t.nome}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Disciplina</label>
                  <input
                    type="text"
                    value={lcDisciplina}
                    readOnly
                    placeholder="Selecione uma turma..."
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 text-gray-700 w-full"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
                  <select
                    value={lcData}
                    onChange={e => setLcData(e.target.value)}
                    disabled={!lcTurma || lcDatas.length === 0}
                    className={`${sel} w-full`}
                  >
                    <option value="">{!lcTurma ? "Selecione uma turma..." : lcDatas.length === 0 ? "Sem datas disponíveis" : "Selecione.."}</option>
                    {lcDatas.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {lcTurma && lcDatas.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">Nenhum dia da semana cadastrado para esta turma.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button onClick={() => setShowLancar(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleLancarAula}
                  disabled={lcLancando || !lcTurma || !lcData}
                  className="px-5 py-2 bg-[#133c86] text-white font-semibold rounded-lg hover:bg-[#0f2e6b] transition-all text-sm disabled:opacity-40"
                >
                  {lcLancando ? "Lançando..." : "Lançar Conteúdo"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
