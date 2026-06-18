"use client";
import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Save, User, Briefcase, GraduationCap,
  FileText, MapPin, HeartPulse, Users, DollarSign, CalendarDays,
} from "lucide-react";
import ConfirmModal from "@/components/modal/ConfirmModal";
import { CalendarioForm } from "@/components/forms/aprendiz/CalendarioForm";
import { AprendizFormData } from "@/components/forms/aprendiz/types";
import { TabAlocacao } from "@/components/forms/aprendiz/TabAlocacao";
import { TabCapacitacao } from "@/components/forms/aprendiz/TabCapacitacao";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import * as caAprendizService from "@/services/caAprendizService";
import { CA_Aprendiz } from "@/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

const UF_LIST = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const TURMAS_CCI: { cod: number; nome: string }[] = [
  { cod: 23,  nome: "Introdutorio" },
  { cod: 39,  nome: "INTRODUTORIO- 05/10" },
  { cod: 327, nome: "Introdutorio Rio Claro" },
  { cod: 336, nome: "Introdutório- Osasco" },
  { cod: 342, nome: "INTRODUTÓRIO- INDAIA" },
  { cod: 343, nome: "INTRODUTÓRIO- CAJAMA" },
  { cod: 395, nome: "INTRODUTÓRIO- VGP" },
  { cod: 440, nome: "Introdutório- Tarde" },
];

const TURMAS_ENC: { cod: number; nome: string }[] = [
  { cod: 21,  nome: "35º A-T-OSASCO" },
  { cod: 22,  nome: "35º A-M-OSASCO" },
  { cod: 24,  nome: "35º A-JANDIRA" },
  { cod: 25,  nome: "35º A-T-SANTANA" },
  { cod: 26,  nome: "35º A-PIRAPORA" },
  { cod: 27,  nome: "35º A-M-SANTANA" },
  { cod: 28,  nome: "35º B-M-BARUERI" },
  { cod: 29,  nome: "35º B-T-BARUERI" },
  { cod: 30,  nome: "35º A-M-BARUERI" },
  { cod: 31,  nome: "35º A-T-BARUERI" },
  { cod: 33,  nome: "35º M-SEMEADOR" },
  { cod: 34,  nome: "35º T-SEMEADOR" },
  { cod: 35,  nome: "35º B-JANDIRA" },
  { cod: 36,  nome: "35ºB-M-Osasco" },
  { cod: 38,  nome: "35ºB-T-Osasco" },
  { cod: 40,  nome: "36ª A- M-Santana" },
  { cod: 41,  nome: "36ª A- M- ETEC" },
  { cod: 42,  nome: "36ª B- M- ETEC" },
  { cod: 43,  nome: "36ª C- M- ETEC" },
  { cod: 44,  nome: "36ª D- M- ETEC" },
  { cod: 45,  nome: "36ª- M- Barueri" },
  { cod: 46,  nome: "36ª-T- Barueri" },
  { cod: 47,  nome: "36ª-M- Adjacentes" },
  { cod: 48,  nome: "36ª-T- Adjacentes" },
  { cod: 49,  nome: "36ª A- Jandira" },
  { cod: 50,  nome: "36ªA-T- Osasco" },
  { cod: 52,  nome: "36ªA-M- Osasco" },
  { cod: 53,  nome: "36ª-T- Semeador" },
  { cod: 54,  nome: "36ª-M- Semeador" },
  { cod: 55,  nome: "36º B-M-OSASCO" },
  { cod: 58,  nome: "36º B-T-OSASCO" },
  { cod: 59,  nome: "36ª Pirapora" },
  { cod: 64,  nome: "37º A-M-BARUERI" },
  { cod: 65,  nome: "37º A-T-BARUERI" },
  { cod: 66,  nome: "37º A- Jandira" },
  { cod: 68,  nome: "37º A-M-Osasco" },
  { cod: 69,  nome: "37º A-T-Osasco" },
  { cod: 70,  nome: "37ª A- M- ETEC" },
  { cod: 71,  nome: "37ª A- T- ETEC" },
  { cod: 72,  nome: "37ª Pirapora" },
  { cod: 73,  nome: "37ª M- Semeador" },
  { cod: 75,  nome: "37ª T- Semeador" },
  { cod: 76,  nome: "37ª B- M- ETEC" },
  { cod: 77,  nome: "37ª B- T- ETEC" },
  { cod: 78,  nome: "37ª M- IOS" },
  { cod: 79,  nome: "37ª T- IOS" },
  { cod: 80,  nome: "37º B-M-Osasco" },
  { cod: 81,  nome: "37º B-T-Osasco" },
  { cod: 82,  nome: "37ª M- Santana" },
  { cod: 83,  nome: "38º M-SEMEADOR" },
  { cod: 85,  nome: "38º A-Osasco M" },
  { cod: 86,  nome: "38º A- OSASCO T" },
  { cod: 88,  nome: "38ª D- T- ETEC" },
  { cod: 89,  nome: "38ª A- M- ETEC" },
  { cod: 90,  nome: "38° Barueri M" },
  { cod: 91,  nome: "38° Barueri T" },
  { cod: 92,  nome: "38ª B- M- ETEC" },
  { cod: 93,  nome: "38ª C- T- ETEC" },
  { cod: 94,  nome: "38º M-Santana" },
  { cod: 95,  nome: "38º T- SEMEADOR" },
  { cod: 96,  nome: "38º B- OSASCO T" },
  { cod: 97,  nome: "38º B- OSASCO M" },
  { cod: 98,  nome: "38º Pirapora" },
  { cod: 99,  nome: "38° M- IOS" },
  { cod: 100, nome: "38° T- IOS" },
  { cod: 103, nome: "39ª A-Osasco-Manhã" },
  { cod: 104, nome: "39ª B-Osasco-Manhã" },
  { cod: 105, nome: "39ª A-Osasco-Tarde" },
  { cod: 106, nome: "39ª B-Osasco-Tarde" },
  { cod: 107, nome: "39ª A-Barueri-Manhã" },
  { cod: 108, nome: "39ª B-Barueri-Manhã" },
  { cod: 109, nome: "39ª A-Barueri-Tarde" },
  { cod: 110, nome: "39ª B-Barueri-Tarde" },
  { cod: 111, nome: "39ª B-ETEC-Manhã" },
  { cod: 112, nome: "39ª A-ETEC-Manhã" },
  { cod: 113, nome: "39ª A-ETEC-Tarde" },
  { cod: 114, nome: "39ª B-ETEC-Tarde" },
  { cod: 115, nome: "39ª Pirapora" },
  { cod: 118, nome: "39ª A-Santana-Manhã" },
  { cod: 119, nome: "39ª B-Santana-Manhã" },
  { cod: 122, nome: "39ª Semeador-Tarde" },
  { cod: 123, nome: "39ª Semeador-Manhã" },
  { cod: 124, nome: "39ª A-IOS-Manhã" },
  { cod: 125, nome: "39ª B-IOS-Manhã" },
  { cod: 126, nome: "39ª A-IOS-Tarde" },
  { cod: 127, nome: "39ª B-IOS-Tarde" },
  { cod: 128, nome: "40ª A-Barueri-Manhã" },
  { cod: 129, nome: "40ª B-Barueri-Manhã" },
  { cod: 130, nome: "40ª A-Barueri-Tarde" },
  { cod: 131, nome: "40ª B-Barueri-Tarde" },
  { cod: 132, nome: "40ª A-Osasco-Manhã" },
  { cod: 133, nome: "40ª B-Osasco-Manhã" },
  { cod: 134, nome: "40ª A-Osasco-Tarde" },
  { cod: 135, nome: "40ª B-Osasco-Tarde" },
  { cod: 136, nome: "40ª A-ETEC-Manhã" },
  { cod: 137, nome: "40ª B-ETEC-Manhã" },
  { cod: 139, nome: "40ª A-ETEC-Tarde" },
  { cod: 141, nome: "40ª B-ETEC-Tarde" },
  { cod: 142, nome: "40ª Pirapora" },
  { cod: 143, nome: "40ª A-Santana-Manhã" },
  { cod: 144, nome: "40ª B-Santana-Manhã" },
  { cod: 145, nome: "40ª A-Santana-Tarde" },
  { cod: 146, nome: "40ª B-Santana-Tarde" },
  { cod: 149, nome: "40ª Semeador-Manhã" },
  { cod: 150, nome: "40ª Semeador-Tarde" },
  { cod: 151, nome: "40ª IOS-Manhã" },
  { cod: 152, nome: "40ª IOS-Tarde" },
  { cod: 153, nome: "41º -A-Osasco-Manhã" },
  { cod: 154, nome: "41º -B-Osasco-Tarde" },
  { cod: 155, nome: "41º -A-Osasco-Tarde" },
  { cod: 156, nome: "41º -B-Osasco-Manhã" },
  { cod: 157, nome: "41º-A-ETEC-Manhã" },
  { cod: 158, nome: "41º-A-ETEC-Tarde" },
  { cod: 160, nome: "41ºA Semeador Manhã" },
  { cod: 161, nome: "41ºA Semeador Tarde" },
  { cod: 162, nome: "41ºA-Santana-Manhã" },
  { cod: 163, nome: "41ºA-Santana-Tarde" },
  { cod: 164, nome: "41º Pirapora" },
  { cod: 165, nome: "41ºA-Barueri-Manhã" },
  { cod: 166, nome: "41ºA-Barueri-Tarde" },
  { cod: 168, nome: "41º IOS - Manhã" },
  { cod: 169, nome: "41º IOS - Tarde" },
  { cod: 170, nome: "42º -A-Osasco-Manha" },
  { cod: 171, nome: "42º -A-Osasco-Tarde" },
  { cod: 173, nome: "42º-B-Osasco-Manha" },
  { cod: 174, nome: "42º-B-Osasco-Tarde" },
  { cod: 175, nome: "42º-A-Manha-Santana" },
  { cod: 176, nome: "42º-A-Tarde-Santana" },
  { cod: 177, nome: "42º-Manha-Etec" },
  { cod: 178, nome: "42º-Tarde-Etec" },
  { cod: 179, nome: "42º-Manha-SEMEADOR" },
  { cod: 180, nome: "42º-Tarde-SEMEADOR" },
  { cod: 181, nome: "42º-Manha-Pirapora" },
  { cod: 183, nome: "42º-Manha-Barueri" },
  { cod: 184, nome: "42º-Tarde-Barueri" },
  { cod: 185, nome: "42º IOS - Manhã - A" },
  { cod: 186, nome: "42º IOS - Manhã - B" },
  { cod: 187, nome: "42º IOS - Tarde - A" },
  { cod: 188, nome: "42º IOS - Tarde - B" },
  { cod: 190, nome: "43º Santana - Manhã" },
  { cod: 191, nome: "43º Santana - Tarde" },
  { cod: 192, nome: "43º Etec - Manhã" },
  { cod: 193, nome: "43º Etec - Tarde" },
  { cod: 194, nome: "43º Semeador - Manhã" },
  { cod: 195, nome: "43º Semeador - Tarde" },
  { cod: 196, nome: "43º Pirapora - Manhã" },
  { cod: 197, nome: "43º Osasco - Manhã A" },
  { cod: 198, nome: "43º Osasco - Tarde A" },
  { cod: 199, nome: "43º Osasco - Manhã B" },
  { cod: 200, nome: "43º Osasco - Tarde B" },
  { cod: 202, nome: "43º IOS A MANHÃ" },
  { cod: 203, nome: "43º IOS B MANHÃ" },
  { cod: 204, nome: "43º IOS A TARDE" },
  { cod: 205, nome: "43º IOS B TARDE" },
  { cod: 207, nome: "44º Semeador - Manhã" },
  { cod: 209, nome: "44º Osasco - Manhã A" },
  { cod: 211, nome: "44º Semeador - Tarde" },
  { cod: 212, nome: "44º Osasco - Manhã B" },
  { cod: 213, nome: "43º-Manha-Barueri" },
  { cod: 214, nome: "44º Osasco - Tarde A" },
  { cod: 215, nome: "44º Osasco - Tarde B" },
  { cod: 216, nome: "43º-Tarde-Barueri" },
  { cod: 217, nome: "44º Santana - Manhã" },
  { cod: 218, nome: "44º Santana - Tarde" },
  { cod: 220, nome: "44º Pirapora - Manhã" },
  { cod: 221, nome: "44º Etec - Manhã" },
  { cod: 222, nome: "44º Etec - Tarde" },
  { cod: 223, nome: "44º IOS A MANHÃ" },
  { cod: 224, nome: "44º IOS B MANHÃ" },
  { cod: 225, nome: "44º IOS A TARDE" },
  { cod: 226, nome: "44º IOS B TARDE" },
  { cod: 228, nome: "45° IOS A MANHÃ" },
  { cod: 229, nome: "45º -A-Osasco-Manhã" },
  { cod: 230, nome: "45º -B-Osasco-Manhã" },
  { cod: 231, nome: "45º -C-Osasco-Manhã" },
  { cod: 232, nome: "45º -D-Osasco-Manhã" },
  { cod: 233, nome: "45º -A-Osasco-Tarde" },
  { cod: 234, nome: "45º -B-Osasco-Tarde" },
  { cod: 235, nome: "45º -C-Osasco-Tarde" },
  { cod: 236, nome: "45º -D-Osasco-Tarde" },
  { cod: 237, nome: "44º-Barueri-Manhã PR" },
  { cod: 238, nome: "44º-Barueri-Manhã SP" },
  { cod: 239, nome: "44º-Barueri-Tarde PR" },
  { cod: 240, nome: "44º-Barueri-Tarde SP" },
  { cod: 242, nome: "45º Santana-Manhã A" },
  { cod: 243, nome: "45º Santana-Tarde A" },
  { cod: 244, nome: "45º Santana-Manhã B" },
  { cod: 245, nome: "45º Santana-Tarde B" },
  { cod: 246, nome: "45º Pirapora - Manhã" },
  { cod: 247, nome: "46° IOS Manhã" },
  { cod: 248, nome: "46° IOS Tarde" },
  { cod: 277, nome: "46º A-Osasco-Manhã" },
  { cod: 278, nome: "46º B-Osasco-Manhã" },
  { cod: 279, nome: "46º A-Osasco-Tarde" },
  { cod: 280, nome: "46º B-Osasco-Tarde" },
  { cod: 281, nome: "45º-Barueri-Manhã PR" },
  { cod: 282, nome: "45º-Barueri-Manhã SP" },
  { cod: 283, nome: "45º-Barueri-Tarde PR" },
  { cod: 285, nome: "45º-Barueri-Tarde SP" },
  { cod: 286, nome: "46º Santana-Manhã A" },
  { cod: 287, nome: "46º Santana-Manhã B" },
  { cod: 288, nome: "46º Santana-Tarde A" },
  { cod: 289, nome: "46º Santana-Tarde B" },
  { cod: 290, nome: "46º Pirapora - Manhã" },
  { cod: 291, nome: "46º Pirapora - Tarde" },
  { cod: 298, nome: "47° IOS Manhã A" },
  { cod: 299, nome: "47° IOS Manhã B" },
  { cod: 300, nome: "47° IOS Tarde A" },
  { cod: 301, nome: "47° IOS Tarde B" },
  { cod: 302, nome: "47º Santana-Manhã A" },
  { cod: 303, nome: "47º Santana-Manhã B" },
  { cod: 304, nome: "47º Santana-Tarde A" },
  { cod: 305, nome: "47º Santana-Tarde B" },
  { cod: 309, nome: "47º Pirapora - Tarde" },
  { cod: 310, nome: "47º Pirapora - Manhã" },
  { cod: 311, nome: "47º A-Osasco-manhã" },
  { cod: 312, nome: "47º B-Osasco-manhã" },
  { cod: 313, nome: "47º A-Osasco-tarde" },
  { cod: 314, nome: "47º B-Osasco-tarde" },
  { cod: 315, nome: "46º Barueri-manhã" },
  { cod: 317, nome: "46º Barueri-tarde" },
  { cod: 319, nome: "48º Santana-Manha A" },
  { cod: 320, nome: "48º Santana tarde  B" },
  { cod: 321, nome: "48º Semeador - Manhã" },
  { cod: 322, nome: "48º Semeador - tarde" },
  { cod: 323, nome: "48° IOS Manhã A" },
  { cod: 324, nome: "48° IOS Tarde B" },
  { cod: 337, nome: "49º Semeador - manhã" },
  { cod: 338, nome: "49º Semeador - tarde" },
  { cod: 340, nome: "49a Santana manhã" },
  { cod: 341, nome: "49a Santana tarde" },
  { cod: 349, nome: "48ª Pirapora - Manhã" },
  { cod: 351, nome: "48ª Pirapora - Tarde" },
  { cod: 353, nome: "50a Santana tarde" },
  { cod: 354, nome: "50º Semeador - manhã" },
  { cod: 355, nome: "50º Semeador - tarde" },
  { cod: 356, nome: "48º -Osasco-manhã" },
  { cod: 357, nome: "48º -Osasco-tarde" },
  { cod: 358, nome: "49° IOS Manhã A" },
  { cod: 359, nome: "49° IOS  TARDE" },
  { cod: 362, nome: "51º Semeador - manhã" },
  { cod: 363, nome: "51º Semeador - tarde" },
  { cod: 364, nome: "51º Santana - tarde" },
  { cod: 365, nome: "50° IOS Manhã A" },
  { cod: 366, nome: "50° IOS Tarde A" },
  { cod: 367, nome: "48º -Osasco-tarde" },
  { cod: 369, nome: "49º -Osasco-manhã" },
  { cod: 370, nome: "49º -Osasco-tarde" },
  { cod: 378, nome: "47º Barueri-T/C e D" },
  { cod: 380, nome: "47º Barueri-M A e B" },
  { cod: 381, nome: "49ª Pirapora  Manhã" },
  { cod: 382, nome: "49ª Pirapora  tarde" },
  { cod: 400, nome: "50ª Pirapora manhã" },
  { cod: 401, nome: "50ª Pirapora tarde" },
  { cod: 402, nome: "52º Semeador - Manhã" },
  { cod: 408, nome: "50º - Osasco - manhã" },
  { cod: 409, nome: "50º - Osasco - tarde" },
  { cod: 410, nome: "52º Santana - Tarde" },
  { cod: 411, nome: "53º Santana - Tarde" },
  { cod: 417, nome: "51ª Pirapora manhã" },
  { cod: 418, nome: "51ª Pirapora tarde" },
  { cod: 419, nome: "53º Santana - Manhã" },
  { cod: 422, nome: "48º BARUERI - MANHÃ" },
  { cod: 423, nome: "48º BARUERI - TARDE" },
  { cod: 424, nome: "53º Semeador - Manhã" },
  { cod: 425, nome: "51° IOS Manhã 2023-2" },
  { cod: 426, nome: "51° IOS Tarde 2023-2" },
  { cod: 427, nome: "52° IOS Manhã 2024-1" },
  { cod: 428, nome: "52° IOS Tarde 2024-1" },
  { cod: 429, nome: "51º A-M-OSASCO" },
  { cod: 430, nome: "51º B-M-OSASCO" },
  { cod: 431, nome: "51º A-T-OSASCO" },
  { cod: 432, nome: "51º B-T-OSASCO" },
  { cod: 433, nome: "52ª Osasco A- Manhã" },
  { cod: 434, nome: "52ª  Osasco B Tarde" },
  { cod: 435, nome: "52ª  Osasco B. Manhã" },
  { cod: 436, nome: "52ª Osasco A -Tarde" },
  { cod: 442, nome: "52ª Castanheiras" },
  { cod: 443, nome: "54ºSemeador Manhã" },
  { cod: 444, nome: "54ºSemeador Tarde" },
  { cod: 446, nome: "54 º Santana Manhã" },
  { cod: 447, nome: "54 º Santana Tarde" },
  { cod: 448, nome: "52ª Pirapora Manhã" },
  { cod: 449, nome: "52ª Pirapora Tarde" },
  { cod: 450, nome: "55ªSemeador -Manhã" },
  { cod: 451, nome: "55ªSemeador Tarde" },
  { cod: 452, nome: "55ª Santana  Tarde" },
  { cod: 453, nome: "53° IOS Manhã 2024-2" },
  { cod: 454, nome: "53° IOS Tarde 2024-2" },
  { cod: 456, nome: "56ª Santana Manhã" },
  { cod: 457, nome: "56ª Santana Tarde" },
  { cod: 458, nome: "56ª Semeador Manhã" },
  { cod: 459, nome: "56ª Semeador Tarde" },
  { cod: 460, nome: "49º BARUERI - MANHÃ" },
  { cod: 461, nome: "49° BARUERI - TARDE" },
  { cod: 462, nome: "53ª Osasco Manhã A" },
  { cod: 463, nome: "53ª Osasco Manhã B" },
  { cod: 464, nome: "53ª  Osasco C Tarde" },
  { cod: 465, nome: "52ª  Osasco D Tarde" },
  { cod: 466, nome: "Ignorar" },
  { cod: 467, nome: "53ª Osasco Tarde D" },
  { cod: 470, nome: "01-BARUERI-CAP MANHA" },
  { cod: 476, nome: "02-BARUERI-CAP MANHA" },
  { cod: 477, nome: "02-BARUERI-CAP TARDE" },
  { cod: 478, nome: "01-BARUERI-CAP-TARDE" },
  { cod: 479, nome: "57ª Santana Tarde" },
  { cod: 480, nome: "57ª Semeador - Manhã" },
  { cod: 481, nome: "57ªSemeador - Tarde" },
  { cod: 482, nome: "57ª Santana Manhã" },
  { cod: 483, nome: "4ª Cooperforte 2025" },
  { cod: 484, nome: "03-BARUERI-CAP-MANHA" },
  { cod: 498, nome: "58º Santana Centro" },
  { cod: 499, nome: "58º Semeador - Manhã" },
  { cod: 502, nome: "58° Semeador Tarde" },
  { cod: 503, nome: "54ª Osasco Manha" },
  { cod: 504, nome: "54ª Osasco Tarde" },
  { cod: 507, nome: "05-BARUERI-CAP MANHA" },
  { cod: 513, nome: "50° BARUERI – MANHÃ" },
  { cod: 514, nome: "50° BARUERI – TARDE" },
  { cod: 515, nome: "59º Fazendinha Manhã" },
  { cod: 516, nome: "59º Fazendinha Tarde" },
  { cod: 517, nome: "59ªSantana Centro Mª" },
  { cod: 518, nome: "59ª Santana Centro T" },
  { cod: 519, nome: "Osasco-55 manhã" },
  { cod: 520, nome: "Osasco 55-tarde" },
  { cod: 521, nome: "Osasco 55-tarde" },
  { cod: 522, nome: "06-Barueri-Cap manhã" },
  { cod: 523, nome: "06-BARUERI-Cap tarde" },
];

function fmtDate(v: string | null | undefined) {
  if (!v) return "";
  try { return new Date(v).toISOString().split("T")[0]; } catch { return ""; }
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="col-span-full text-sm font-semibold text-[#133c86] uppercase tracking-wide border-b border-gray-200 pb-1 mt-4 mb-1 first:mt-0">
      {title}
    </h3>
  );
}

function Field({
  label, name, value, onChange, type = "text", required = false,
  className = "", children, disabled = false,
}: {
  label: string; name: string; value: string | number | null | undefined;
  onChange: React.ChangeEventHandler<any>; type?: string; required?: boolean;
  className?: string; children?: React.ReactNode; disabled?: boolean;
}) {
  const base = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86] disabled:bg-gray-100 disabled:text-gray-500";
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children ?? (
        <input name={name} type={type} value={value ?? ""} onChange={onChange}
          required={required} disabled={disabled} className={base} />
      )}
    </div>
  );
}

function Sel({
  label, name, value, onChange, required = false, className = "", children, disabled = false,
}: {
  label: string; name: string; value: string | number | null | undefined;
  onChange: React.ChangeEventHandler<HTMLSelectElement>; required?: boolean;
  className?: string; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select name={name} value={value ?? ""} onChange={onChange} required={required}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86] disabled:bg-gray-100 disabled:text-gray-500">
        {children}
      </select>
    </div>
  );
}

function UFSelect({ name, value, onChange, label = "UF" }: {
  name: string; value: string | null | undefined;
  onChange: React.ChangeEventHandler<HTMLSelectElement>; label?: string;
}) {
  return (
    <Sel label={label} name={name} value={value} onChange={onChange}>
      <option value="">UF</option>
      {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
    </Sel>
  );
}

// ─── tab forms ───────────────────────────────────────────────────────────────

function TabJovem({
  f, hc, unidades, instituicoes, escolas, turmas, situacoes, areasAtuacao, planos, motivos,
  onEscolaChange, escolaEndereco, cidades, onUFNatChange, confirmAprSenha, onConfirmAprSenhaChange,
}: {
  f: CA_Aprendiz; hc: React.ChangeEventHandler<any>;
  unidades: any[]; instituicoes: any[]; escolas: any[]; turmas: any[];
  situacoes: any[]; areasAtuacao: any[]; planos: any[]; motivos: any[];
  onEscolaChange: React.ChangeEventHandler<HTMLSelectElement>;
  escolaEndereco: string;
  cidades: { MunICodigo: string; MunIDescricao: string }[];
  onUFNatChange: React.ChangeEventHandler<HTMLSelectElement>;
  confirmAprSenha: string;
  onConfirmAprSenhaChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Dados do Jovem" />

      {/* Código — somente leitura */}
      <Field label="Código" name="Apr_Codigo" value={f.Apr_Codigo} onChange={hc} disabled />

      <Field label="Nome Completo" name="Apr_Nome" value={f.Apr_Nome} onChange={hc} required className="lg:col-span-2" />
      <Field label="Nome Social" name="Apr_NomeSocial" value={f.Apr_NomeSocial} onChange={hc} className="lg:col-span-2" />

      {/* Unidade em destaque */}
      <Sel label="Unidade" name="Apr_Unidade" value={f.Apr_Unidade} onChange={hc}>
        <option value="">Selecione</option>
        {unidades.map((u: any) => (
          <option key={u.UniCodigo} value={u.UniCodigo}>{u.UniNome}</option>
        ))}
      </Sel>
      <Sel label="Instituição Parceira" name="Apr_InstParceira" value={f.Apr_InstParceira} onChange={hc}>
        <option value="">Selecione</option>
        {instituicoes.map((i: any, idx: number) => (
          <option key={i.IpaCodigo ?? idx} value={i.IpaCodigo ?? ""}>
            {i.IpaDescricao}
          </option>
        ))}
      </Sel>
      <Field label="Nº Sistema Externo" name="Apr_NumSistExterno" value={f.Apr_NumSistExterno} onChange={hc} />
      <Field label="CBO" name="Apr_CBO" value={f.Apr_CBO} onChange={hc} />
      <Field label="Data de Nascimento" name="Apr_DataDeNascimento" value={f.Apr_DataDeNascimento} onChange={hc} type="date" />

      <Sel label="Sexo" name="Apr_Sexo" value={f.Apr_Sexo} onChange={hc}>
        <option value="">Selecione</option>
        <option value="M">Masculino</option>
        <option value="F">Feminino</option>
      </Sel>
      <Sel label="Estado Civil" name="AprEstadoCivil" value={f.AprEstadoCivil} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Solteiro">Solteiro(a)</option>
        <option value="Casado">Casado(a)</option>
        <option value="Divorciado">Divorciado(a)</option>
        <option value="Viúvo">Viúvo(a)</option>
        <option value="União Estável">União Estável</option>
      </Sel>
      <Sel label="Alistamento Militar" name="Apr_Exercito" value={f.Apr_Exercito} onChange={hc}>
        <option value="">Selecione</option>
        <option value="S">Sim</option>
        <option value="N">Não</option>
      </Sel>

      <Field label="Nacionalidade" name="Apr_Nacionalidade" value={f.Apr_Nacionalidade} onChange={hc} />
      <UFSelect name="Apr_UF_Nat" value={f.Apr_UF_Nat} onChange={onUFNatChange} label="UF de Naturalidade" />
      <Sel label="Naturalidade" name="Apr_Naturalidade" value={f.Apr_Naturalidade} onChange={hc} disabled={!f.Apr_UF_Nat}>
        <option value="">Selecione</option>
        {cidades.map(c => <option key={c.MunICodigo} value={c.MunICodigo}>{c.MunIDescricao}</option>)}
      </Sel>

      <Sel label="É Estudante?" name="Apr_Estudante" value={f.Apr_Estudante} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Sel>
      <Sel label="Turno Escolar" name="Apr_TurnoEscolar" value={f.Apr_TurnoEscolar} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Manhã">Manhã</option>
        <option value="Tarde">Tarde</option>
        <option value="Noite">Noite</option>
        <option value="Integral">Integral</option>
      </Sel>
      <Sel label="Escolaridade" name="Apr_Escolaridade" value={f.Apr_Escolaridade} onChange={hc}>
        <option value="">Selecione</option>
        <option value="1">Fundamental Incompleto</option>
        <option value="2">Fundamental Completo</option>
        <option value="3">Médio Incompleto</option>
        <option value="4">Médio Completo</option>
        <option value="5">Superior Incompleto</option>
        <option value="6">Superior Completo</option>
        <option value="7">Pós-Graduação</option>
      </Sel>

      <Sel label="Tipo de Aprendizagem" name="Apr_TipoAprendizagem" value={f.Apr_TipoAprendizagem} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Escola Municipal">Escola Municipal</option>
        <option value="Escola Estadual">Escola Estadual</option>
        <option value="Escola Particular">Escola Particular</option>
      </Sel>
      <Sel label="Tipo de Pagamento" name="Apr_TipoContrato" value={f.Apr_TipoContrato} onChange={hc}>
        <option value="">Selecione</option>
        <option value="C">Projov</option>
        <option value="E">Empresa</option>
      </Sel>
      <Field label="Data do Contrato" name="Apr_DataContrato" value={f.Apr_DataContrato} onChange={hc} type="date" />

      <Sel label="Escola" name="AprCodEscola" value={f.AprCodEscola} onChange={onEscolaChange}>
        <option value="">Selecione</option>
        {escolas.map((e: any, idx: number) => (
          <option key={e.EscCodigo ?? idx} value={e.EscCodigo ?? ""}>
            {e.EscNome}
          </option>
        ))}
      </Sel>
      <Field label="Nome da Escola" name="Apr_NomeEscola" value={f.Apr_NomeEscola} onChange={hc} />
      <Field label="Endereço da Escola" name="_escolaEndereco" value={escolaEndereco} onChange={hc} disabled />

      <Sel label="Status do Jovem" name="Apr_Situacao" value={f.Apr_Situacao} onChange={hc}>
        <option value="">Selecione</option>
        {situacoes.map((s: any, idx: number) => (
          <option key={s.StaCodigo ?? idx} value={s.StaCodigo ?? ""}>
            {s.StaDescricao}
          </option>
        ))}
      </Sel>
      <Sel label="Motivo de Desligamento" name="AprMotivoDesligamento1" value={f.AprMotivoDesligamento1} onChange={hc}>
        <option value="">Selecione</option>
        {motivos.map((m: any, idx: number) => (
          <option key={m.MotCodigo ?? idx} value={m.MotCodigo ?? ""}>
            {m.MotDescricao}
          </option>
        ))}
      </Sel>

      <Field label="Início na Empresa" name="Apr_DataInicioEmpresa" value={f.Apr_DataInicioEmpresa} onChange={hc} type="date" />
      <Field label="Início da Aprendizagem" name="Apr_InicioAprendizagem" value={f.Apr_InicioAprendizagem} onChange={hc} type="date" />
      <Field label="Término da Aprendizagem" name="Apr_FimAprendizagem" value={f.Apr_FimAprendizagem} onChange={hc} type="date" />
      <Field label="Previsão de Término" name="Apr_PrevFimAprendizagem" value={f.Apr_PrevFimAprendizagem} onChange={hc} type="date" />
      <Field label="Início das Férias" name="Apr_DataInicioFerias" value={f.Apr_DataInicioFerias} onChange={hc} type="date" />
      <Field label="Término das Férias" name="Apr_DataTerminoFerias" value={f.Apr_DataTerminoFerias} onChange={hc} type="date" />

      <Sel label="Turma Simultaneidade" name="Apr_Turma" value={f.Apr_Turma} onChange={hc}>
        <option value="">Selecione</option>
        {turmas.map((t: any, idx: number) => (
          <option key={t.TurCodigo ?? idx} value={t.TurCodigo ?? ""}>
            {t.TurNome}
          </option>
        ))}
      </Sel>
      <Sel label="Turma CCI" name="Apr_TurmaCCI" value={f.Apr_TurmaCCI} onChange={hc}>
        <option value="">Selecione</option>
        {TURMAS_CCI.map(t => (
          <option key={t.cod} value={t.cod}>{t.nome}</option>
        ))}
      </Sel>
      <Sel label="Capacitação (Turma ENC)" name="Apr_TurmaENC" value={f.Apr_TurmaENC} onChange={hc}>
        <option value="">Selecione</option>
        {TURMAS_ENC.map(t => (
          <option key={t.cod} value={t.cod}>{t.nome}</option>
        ))}
      </Sel>
      <Field label="Horas Diárias" name="Apr_HorasDiarias" value={f.Apr_HorasDiarias} onChange={hc} type="number" />
      <Field label="Meses de Contrato" name="Apr_MesesContrato" value={f.Apr_MesesContrato} onChange={hc} type="number" />
      <Sel label="Área de Atuação" name="Apr_AreaAtuacao" value={f.Apr_AreaAtuacao} onChange={hc}>
        <option value="">Selecione</option>
        {areasAtuacao.map((a: any, idx: number) => (
          <option key={a.AreaCodigo ?? idx} value={a.AreaCodigo ?? ""}>
            {a.AreaDescricao}
          </option>
        ))}
      </Sel>
      <Sel label="Plano Curricular" name="Apr_PlanoCurricular" value={f.Apr_PlanoCurricular} onChange={hc}>
        <option value="">Selecione</option>
        {planos.map((p: any, idx: number) => (
          <option key={p.PlanCodigo ?? idx} value={p.PlanCodigo ?? ""}>
            {p.PlanDescricao}
          </option>
        ))}
      </Sel>

      <Field label="Nome da Mãe" name="Apr_NomeMae" value={f.Apr_NomeMae} onChange={hc} className="lg:col-span-2" />
      <Field label="Nome do Pai" name="Apr_NomePai" value={f.Apr_NomePai} onChange={hc} className="lg:col-span-2" />

      <Sel label="Piercing" name="Apr_Piercing" value={f.Apr_Piercing} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Sel>
      <Sel label="Tatuagem" name="Apr_Tatuagem" value={f.Apr_Tatuagem} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Sel>

      <Field label="Usuário de Cadastro" name="Apr_UsuarioCadastro" value={f.Apr_UsuarioCadastro} onChange={hc} disabled />
      <Field label="Data de Cadastro" name="Apr_DataCadastro" value={f.Apr_DataCadastro} onChange={hc} type="date" disabled />
      <Field label="Senha de Acesso" name="Apr_senha" value={f.Apr_senha ?? ""} onChange={hc} type="password" />
      <Field label="Confirme a Senha de Acesso" name="confirmAprSenha" value={confirmAprSenha} onChange={onConfirmAprSenhaChange} type="password" />

      <div className="col-span-full flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Observações</label>
        <textarea name="Apr_Observacoes" value={f.Apr_Observacoes ?? ""} onChange={hc} rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86]" />
      </div>

      <SectionTitle title="Mensagem ao Aluno" />
      <div className="col-span-full flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Mensagem</label>
        <textarea name="Apr_Mensagem" value={f.Apr_Mensagem ?? ""} onChange={hc} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86]" />
      </div>
      <Field label="Validade da Mensagem" name="Apr_ValidadeMensagem" value={f.Apr_ValidadeMensagem} onChange={hc} type="date" />
    </div>
  );
}

function TabSocioEconomico({ f, hc, parentescos }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any>; parentescos: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
       <SectionTitle title="Dados do Responsável / Familiar" />
      <Field label="Nome do Responsável" name="Apr_Responsavel" value={f.Apr_Responsavel} onChange={hc} className="lg:col-span-2" />
      <Field label="CPF do Responsável" name="Apr_Resp_CPF" value={f.Apr_Resp_CPF} onChange={hc} />
      <Sel label="Estado Civil" name="Apr_Resp_EstadoCivil" value={f.Apr_Resp_EstadoCivil} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Solteiro">Solteiro(a)</option>
        <option value="Casado">Casado(a)</option>
        <option value="Divorciado">Divorciado(a)</option>
        <option value="Viúvo">Viúvo(a)</option>
        <option value="União Estável">União Estável</option>
      </Sel>
      <Field label="Grau de Instrução" name="Apr_Resp_GrauInstrucao" value={f.Apr_Resp_GrauInstrucao} onChange={hc} />
      <Field label="Profissão" name="Apr_Resp_Profissao" value={f.Apr_Resp_Profissao} onChange={hc} />
      <Sel label="Grau de Parentesco" name="Apr_Resp_Parentesco" value={f.Apr_Resp_Parentesco} onChange={hc}>
        <option value="">Selecione</option>
        {parentescos.map((p: any, idx: number) => (
          <option key={p.GpaCodigo ?? idx} value={p.GpaCodigo ?? ""}>{p.GpaDescricao}</option>
        ))}
      </Sel>

      <SectionTitle title="Contato do Responsável" />
      <Field label="Telefone" name="Apr_Telefone_Resp" value={f.Apr_Telefone_Resp} onChange={hc} />
      <Field label="Celular" name="Apr_Celular_Resp" value={f.Apr_Celular_Resp} onChange={hc} />
      <Field label="Telefone de Contato" name="Apr_Telefone_Contato" value={f.Apr_Telefone_Contato} onChange={hc} />
      <Field label="Tipo de Contato" name="Apr_Tipo_Contato" value={f.Apr_Tipo_Contato} onChange={hc} />

      <SectionTitle title="Observações" />
      <div className="col-span-full flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Observações sobre o Responsável</label>
        <textarea name="Apr_Resp_Observacoes" value={f.Apr_Resp_Observacoes ?? ""} onChange={hc} rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86]" />
      </div>
      <SectionTitle title="Dados Sócio-econômicos" />
      <Sel label="Situação da Residência" name="Apr_SituacaoResidencia" value={f.Apr_SituacaoResidencia} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Própria">Própria</option>
        <option value="Alugada">Alugada</option>
        <option value="Cedida">Cedida</option>
        <option value="Financiada">Financiada</option>
        <option value="Outros">Outros</option>
      </Sel>
      <Field label="Valor do Aluguel (R$)" name="Apr_aluguel" value={f.Apr_aluguel} onChange={hc} type="number" />
      <Field label="Nº de Familiares" name="Apr_NumeroFamiliares" value={f.Apr_NumeroFamiliares} onChange={hc} type="number" />
      <Sel label="Recebe Benefício?" name="Apr_recebebeneficio" value={f.Apr_recebebeneficio} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Sel>
      <Field label="Tipo de Benefício" name="Apr_beneficio" value={f.Apr_beneficio} onChange={hc} />
      <Field label="Bolsa Família (R$)" name="Apr_BolsaFamilia" value={f.Apr_BolsaFamilia} onChange={hc} type="number" />
      <Field label="Pensão (R$)" name="Apr_pensao" value={f.Apr_pensao} onChange={hc} type="number" />
      <Field label="Outros (R$)" name="Apr_outros" value={f.Apr_outros} onChange={hc} type="number" />

      <SectionTitle title="Emprego Anterior" />
      <Sel label="Carteira Assinada?" name="Apr_CarteiraAssinada" value={f.Apr_CarteiraAssinada} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Sel>
      <Field label="Empresa" name="Apr_Empresa" value={f.Apr_Empresa} onChange={hc} />
      <Field label="Cargo" name="Apr_Cargo" value={f.Apr_Cargo} onChange={hc} />
      <Field label="Tempo de Permanência" name="Apr_TempoPermanencia" value={f.Apr_TempoPermanencia} onChange={hc} />
    </div>
  );
}

// function TabEscolaridade({ f, hc }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any> }) {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//       <SectionTitle title="Horários da Escola" />
//       <Field label="Horário de Início" name="Apr_Escola_HInicio" value={f.Apr_Escola_HInicio} onChange={hc} />
//       <Field label="Horário de Término" name="Apr_Escola_HTermino" value={f.Apr_Escola_HTermino} onChange={hc} />
//     </div>
//   );
// }

function TabDocumentacao({ f, hc }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Carteira de Identidade" />
      <Field label="Número do RG" name="Apr_CarteiraDeIdentidade" value={f.Apr_CarteiraDeIdentidade} onChange={hc} />
      <Field label="Data de Emissão" name="Apr_DataEmissao_Ident" value={f.Apr_DataEmissao_Ident} onChange={hc} type="date" />
      <Field label="Órgão Emissor" name="Apr_OrgaoEmissor_Ident" value={f.Apr_OrgaoEmissor_Ident} onChange={hc} />
      <UFSelect name="Apr_UF_Ident" value={f.Apr_UF_Ident} onChange={hc} />

      <SectionTitle title="CPF e PIS" />
      <Field label="CPF" name="Apr_CPF" value={f.Apr_CPF} onChange={hc} />
      <Field label="PIS" name="Apr_PIS" value={f.Apr_PIS} onChange={hc} />
      <Field label="PNE" name="Apr_PNE" value={f.Apr_PNE} onChange={hc} />

      <SectionTitle title="Carteira de Trabalho" />
      <Field label="Número da CTPS" name="Apr_CarteiraDeTrabalho" value={f.Apr_CarteiraDeTrabalho} onChange={hc} />
      <Field label="Série" name="Apr_Serie_Cartrab" value={f.Apr_Serie_Cartrab} onChange={hc} />
      <Field label="Data de Emissão" name="Apr_DataEmissao_CartTrab" value={f.Apr_DataEmissao_CartTrab} onChange={hc} type="date" />
      <UFSelect name="Apr_UF_CartTrab" value={f.Apr_UF_CartTrab} onChange={hc} />

      <SectionTitle title="Título de Eleitor" />
      <Field label="Número do Título" name="Apr_NumeroTitulo" value={f.Apr_NumeroTitulo} onChange={hc} />
      <Field label="Seção" name="Apr_SecaoTitulo" value={f.Apr_SecaoTitulo} onChange={hc} />
      <Field label="Zona" name="Apr_ZonaTitulo" value={f.Apr_ZonaTitulo} onChange={hc} />
    </div>
  );
}

function TabEndereco({ f, hc, buscaCEP }: {
  f: CA_Aprendiz; hc: React.ChangeEventHandler<any>; buscaCEP: (cep: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Endereço" />
      <Field label="CEP" name="Apr_CEP" value={f.Apr_CEP} onChange={hc}>
        <input name="Apr_CEP" value={f.Apr_CEP ?? ""}
          onChange={(e) => { hc(e); buscaCEP(e.target.value); }}
          placeholder="00000-000"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#133c86]/30 focus:border-[#133c86]" />
      </Field>
      <Field label="Logradouro" name="Apr_Endereco" value={f.Apr_Endereco} onChange={hc} className="lg:col-span-2" />
      <Field label="Número" name="Apr_NumeroEndereco" value={f.Apr_NumeroEndereco} onChange={hc} />
      <Field label="Complemento" name="Apr_Complemento" value={f.Apr_Complemento} onChange={hc} />
      <Field label="Bairro" name="Apr_Bairro" value={f.Apr_Bairro} onChange={hc} />
      <Field label="Município" name="Apr_Cidade" value={f.Apr_Cidade} onChange={hc} />
      <UFSelect name="Apr_UF" value={f.Apr_UF} onChange={hc} />

      <SectionTitle title="Contato" />
      <Field label="Telefone" name="Apr_Telefone" value={f.Apr_Telefone} onChange={hc} />
      <Field label="Celular" name="Apr_Celular" value={f.Apr_Celular} onChange={hc} />
      <Field label="E-mail" name="Apr_Email" value={f.Apr_Email} onChange={hc} type="email" />
      <Field label="Outros Telefones" name="Apr_OutrosTelefones" value={f.Apr_OutrosTelefones} onChange={hc} />

      <SectionTitle title="Tentativas de Contato" />
      <Field label="Tentativa Principal" name="Apr_TentativaContato" value={f.Apr_TentativaContato} onChange={hc} />
      <Field label="Tentativa 1" name="Apr_TentaticaContato01" value={f.Apr_TentaticaContato01} onChange={hc} />
      <Field label="Tentativa 2" name="Apr_TentaticaContato02" value={f.Apr_TentaticaContato02} onChange={hc} />
      <Field label="Tentativa 3" name="Apr_TentaticaContato03" value={f.Apr_TentaticaContato03} onChange={hc} />
    </div>
  );
}

function TabFamiliares({ f, hc }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
     
    </div>
  );
}



function TabSaude({ f, hc }: { f: CA_Aprendiz; hc: React.ChangeEventHandler<any> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SectionTitle title="Deficiência" />
      <Field label="Deficiência" name="Apr_Deficiencia" value={f.Apr_Deficiencia} onChange={hc} className="lg:col-span-3" />

      <SectionTitle title="Medicamentos" />
      <Sel label="Usa Medicamento?" name="Apr_UsaMedicamento" value={f.Apr_UsaMedicamento} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Sel>
      <Field label="Nome do Medicamento" name="Apr_NomeMedicamento" value={f.Apr_NomeMedicamento} onChange={hc} />
      <Field label="Finalidade / Tipo" name="Apr_TipoMedicamento" value={f.Apr_TipoMedicamento} onChange={hc} />

      <SectionTitle title="Alergias" />
      <Sel label="Tem Alergia?" name="Apr_Alergia" value={f.Apr_Alergia} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Sel>
      <Field label="Qual Alergia?" name="Apr_TipoAlergia" value={f.Apr_TipoAlergia} onChange={hc} className="lg:col-span-2" />

      <SectionTitle title="Doenças" />
      <Sel label="Tem Doença?" name="Apr_Doenca" value={f.Apr_Doenca} onChange={hc}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </Sel>
      <Field label="Qual Doença?" name="Apr_NomeDoenca" value={f.Apr_NomeDoenca} onChange={hc} className="lg:col-span-2" />
    </div>
  );
}

// ─── date fields ──────────────────────────────────────────────────────────────

const DATE_FIELDS: (keyof CA_Aprendiz)[] = [
  "Apr_DataDeNascimento", "Apr_DataInicioEmpresa", "Apr_InicioAprendizagem",
  "Apr_PrevFimAprendizagem", "Apr_FimAprendizagem", "Apr_DataContrato",
  "Apr_DataInicioFerias", "Apr_DataTerminoFerias", "Apr_DataCadastro",
  "Apr_DataEmissao_Ident", "Apr_DataEmissao_CartTrab", "Apr_ValidadeMensagem",
];

// ─── main ─────────────────────────────────────────────────────────────────────

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [unidades, setUnidades] = useState<any[]>([]);
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [parceiros, setParceiros] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [situacoes, setSituacoes] = useState<any[]>([]);
  const [areasAtuacao, setAreasAtuacao] = useState<any[]>([]);
  const [planos, setPlanos] = useState<any[]>([]);
  const [motivos, setMotivos] = useState<any[]>([]);
  const [parentescos, setParentescos] = useState<any[]>([]);
  const [cidades, setCidades] = useState<{ MunICodigo: string; MunIDescricao: string }[]>([]);
  const [escolaEndereco, setEscolaEndereco] = useState("");
  const [formData, setFormData] = useState<CA_Aprendiz>({});
  const [confirmAprSenha, setConfirmAprSenha] = useState("");
  const [calFormData, setCalFormData] = useState<AprendizFormData>({ NomeJovem: "" });
  const [rascunhoSalvoEm, setRascunhoSalvoEm] = useState<Date | null>(null);
  const [calendarMode, setCalendarMode] = useState<"aprendiz" | "turma">("aprendiz");
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextDraftSave = useRef(false);
  const isAprendizAccess = userRole === "APRENDIZ";
  const isEducadorAccess = userRole === "EDUCADOR";
  const canEditAprendiz = !isEducadorAccess;
  const canViewExtendedTabs = !isAprendizAccess;

  const tabs = useMemo(() => [
    { id: "jovem",        label: "Jovem",           icon: <User size={16} /> },
    { id: "socio",        label: "Sócio-Econômico", icon: <DollarSign size={16} /> },
    { id: "documentacao", label: "Documentação",    icon: <FileText size={16} /> },
    { id: "endereco",     label: "Endereço",        icon: <MapPin size={16} /> },
    { id: "saude",        label: "Saúde",           icon: <HeartPulse size={16} /> },
    ...(canViewExtendedTabs ? [{ id: "calendario", label: "Calendário", icon: <CalendarDays size={16} /> }] : []),
    ...(editingId && canViewExtendedTabs ? [{ id: "alocacoes",    label: "Alocações",    icon: <MapPin size={16} /> }] : []),
    ...(editingId && canViewExtendedTabs ? [{ id: "capacitacoes", label: "Capacitações", icon: <GraduationCap size={16} /> }] : []),
  ], [editingId, canViewExtendedTabs]);
  const [activeTab, setActiveTab] = useState("jovem");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "calendario-turma") {
      setActiveTab("calendario");
      setCalendarMode("turma");
      return;
    }
    if (tab === "calendario") setCalendarMode("aprendiz");
    if (tab && tabs.some(t => t.id === tab)) setActiveTab(tab);
  }, [searchParams, tabs]);

  useEffect(() => {
    if (!isAdmin && !tabs.some(t => t.id === activeTab)) {
      setActiveTab("jovem");
    }
  }, [activeTab, isAdmin, tabs]);

  const handleCalendarModeChange = useCallback((mode: "aprendiz" | "turma") => {
    setCalendarMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", mode === "turma" ? "calendario-turma" : "calendario");
    router.replace(`/aprendizes/cadaprendizes?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    const userStr = localStorage.getItem("projov_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserRole(u.UsuTipo || "");
        if (u.UsuTipo === "APRENDIZ") setIsAdmin(false);
        if (u.UsuTipo === "EDUCADOR") setIsAdmin(false);
      } catch {}
    }
    loadSelectData();
    if (editingId) {
      fetchAprendiz(Number(editingId));
    } else {
      api.get("/aprendiz/rascunho").then(res => {
        const dados = res.data.data?.dados;
        if (!dados) return;
        skipNextDraftSave.current = true;
        const formatted: any = { ...dados };
        DATE_FIELDS.forEach(f => { formatted[f] = fmtDate(formatted[f]); });
        formatted.Apr_senha = "";
        setFormData(formatted);
        setConfirmAprSenha("");
        setRascunhoSalvoEm(new Date(res.data.data.updatedAt));
        toast("Rascunho restaurado automaticamente.", { icon: "📋" });
      }).catch(() => {});
    }
  }, [editingId]);

  const loadSelectData = useCallback(async () => {
    const CACHE = "cad_ca_select_v9";
    try {
      const cached = sessionStorage.getItem(CACHE);
      if (cached) {
        const p = JSON.parse(cached);
        setUnidades(p.unidades);
        setInstituicoes(p.instituicoes);
        setParceiros(p.parceiros ?? []);
        setEscolas(p.escolas);
        setTurmas(p.turmas);
        setSituacoes(p.situacoes ?? []);
        setAreasAtuacao(p.areasAtuacao ?? []);
        setPlanos(p.planos ?? []);
        setMotivos(p.motivos ?? []);
        setParentescos(p.parentescos ?? []);
        return;
      }
      const [resU, resI, resPar, resE, resT, resS, resA, resP, resM, resGP] = await Promise.allSettled([
        api.get("/unidade?limit=1000"),
        api.get("/instituicoes-parceiras?limit=1000"),
        api.get("/parceiros?limit=1000"),
        api.get("/escolas"),
        api.get("/turmas?limit=1000"),
        api.get("/situacao-participante?limit=200"),
        api.get("/areas?limit=1000"),
        api.get("/planos?limit=1000"),
        api.get("/motivo-desligamento?limit=1000"),
        api.get("/grau-parentesco?limit=1000"),
      ]);
      const data = {
        unidades:     resU.status === "fulfilled" ? (resU.value.data.data ?? []) : [],
        instituicoes: resI.status === "fulfilled" ? (resI.value.data.data ?? []) : [],
        parceiros:    resPar.status === "fulfilled" ? (resPar.value.data.data ?? []) : [],
        escolas:      resE.status === "fulfilled" ? (resE.value.data.data ?? []) : [],
        turmas:       resT.status === "fulfilled" ? (resT.value.data.data ?? []) : [],
        situacoes:    resS.status === "fulfilled" ? (resS.value.data.data ?? []) : [],
        areasAtuacao: resA.status === "fulfilled" ? (resA.value.data.data ?? []) : [],
        planos:       resP.status === "fulfilled" ? (resP.value.data.data ?? []) : [],
        motivos:      resM.status === "fulfilled" ? (resM.value.data.data ?? []) : [],
        parentescos:  resGP.status === "fulfilled" ? (resGP.value.data.data ?? []) : [],
      };
      sessionStorage.setItem(CACHE, JSON.stringify(data));
      setUnidades(data.unidades);
      setInstituicoes(data.instituicoes);
      setParceiros(data.parceiros);
      setEscolas(data.escolas);
      setTurmas(data.turmas);
      setSituacoes(data.situacoes);
      setAreasAtuacao(data.areasAtuacao);
      setPlanos(data.planos);
      setMotivos(data.motivos);
      setParentescos(data.parentescos);
    } catch (err) {
      console.error("Erro ao carregar dados auxiliares", err);
    }
  }, []);

  const fetchAprendiz = async (id: number) => {
    setLoading(true);
    try {
      const record = await caAprendizService.getById(id);
      const formatted: any = { ...record };
      DATE_FIELDS.forEach(f => { formatted[f] = fmtDate(formatted[f]); });
      formatted.Apr_senha = "";
      setFormData(formatted);
      setConfirmAprSenha("");
      // calFormData guarda apenas campos de cálculo sem coluna em CA_Aprendiz.
      // Os campos Apr_* (curso, jornada, datas, empresa, férias) são lidos
      // diretamente de formData no CalendarioForm.
      setCalFormData({ NomeJovem: "" });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados do aprendiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleCalChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (isEducadorAccess) return;
    const { name, value } = e.target;
    setCalFormData(prev => ({ ...prev, [name]: value }));
  }, [isEducadorAccess]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (isEducadorAccess) return;
    const { name, value } = e.target;
    const numericFields = [
      "Apr_Unidade", "Apr_InstParceira", "Apr_Turma", "Apr_TurmaCCI", "Apr_TurmaENC",
      "Apr_PlanoCurricular", "Apr_AreaAtuacao", "Apr_HorasDiarias", "Apr_MesesContrato",
      "AprMotivoDesligamento1", "Apr_Situacao", "Apr_Escolaridade",
      "Apr_Resp_Parentesco", "AprCodEscola",
      "Apr_aluguel", "Apr_NumeroFamiliares", "Apr_BolsaFamilia", "Apr_pensao", "Apr_outros",
    ];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? (value === "" ? null : Number(value))
        : (value === "" ? null : value),
    }));
  }, [isEducadorAccess]);

  const handleConfirmAprSenhaChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (isEducadorAccess) return;
    setConfirmAprSenha(e.target.value);
  }, [isEducadorAccess]);

  useEffect(() => {
    const uf = formData.Apr_UF_Nat;
    if (!uf) { setCidades([]); return; }
    api.get(`/municipios?uf=${uf}`)
      .then(res => setCidades(res.data.data ?? []))
      .catch(() => setCidades([]));
  }, [formData.Apr_UF_Nat]);

  const onUFNatChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isEducadorAccess) return;
    const uf = e.target.value || null;
    setFormData(prev => ({ ...prev, Apr_UF_Nat: uf, Apr_Naturalidade: null }));
  }, [isEducadorAccess]);

  const onEscolaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isEducadorAccess) return;
    const cod = e.target.value ? Number(e.target.value) : null;
    const found = escolas.find((x: any) => x.EscCodigo === cod);
    setFormData(prev => ({ ...prev, AprCodEscola: cod, Apr_NomeEscola: found?.EscNome ?? prev.Apr_NomeEscola }));
    setEscolaEndereco(found?.EscEndereco ?? "");
  }, [escolas, isEducadorAccess]);

  useEffect(() => {
    if (editingId) return;
    if (isEducadorAccess) return;
    if (!formData.Apr_Nome) return;
    if (skipNextDraftSave.current) { skipNextDraftSave.current = false; return; }
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(async () => {
      try {
        const draftData = { ...formData };
        delete draftData.Apr_senha;
        await api.put("/aprendiz/rascunho", { dados: draftData });
        setRascunhoSalvoEm(new Date());
      } catch {}
    }, 2000);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [formData, editingId, isEducadorAccess]);

  const descartarRascunho = useCallback(async () => {
    try {
      await api.delete("/aprendiz/rascunho");
      setFormData({});
      setConfirmAprSenha("");
      setRascunhoSalvoEm(null);
      toast.success("Rascunho descartado.");
    } catch {
      toast.error("Erro ao descartar rascunho.");
    }
  }, []);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const requestSave = () => {
    if (!canEditAprendiz) return;
    if (editingId) {
      setShowSaveConfirm(true);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (!canEditAprendiz) return;
    const aprSenha = formData.Apr_senha?.trim() ?? "";
    const confirmSenha = confirmAprSenha.trim();
    if (aprSenha || confirmSenha) {
      if (aprSenha.length < 6) {
        toast.error("A senha do aprendiz deve ter no minimo 6 caracteres.");
        return;
      }
      if (aprSenha !== confirmSenha) {
        toast.error("As senhas do aprendiz nao coincidem.");
        return;
      }
    }
    if (!formData.Apr_Nome) {
      toast.error("O nome completo é obrigatório.");
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await caAprendizService.update(Number(editingId), formData);
        toast.success("Aprendiz atualizado com sucesso!");
      } else {
        await caAprendizService.create(formData);
        toast.success("Aprendiz cadastrado com sucesso!");
        api.delete("/aprendiz/rascunho").catch(() => {});
      }
      setFormData(prev => ({ ...prev, Apr_senha: "" }));
      setConfirmAprSenha("");
      if (isAdmin && !editingId) router.push("/aprendizes");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao salvar aprendiz.");
    } finally {
      setLoading(false);
    }
  };

  const buscaCEP = useCallback(async (cep: string) => {
    if (isEducadorAccess) return;
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`/api/cep/${clean}`);
      if (!res.ok) { toast.error("Erro ao consultar CEP."); return; }
      const data = await res.json();
      if (data.erro) { toast.error("CEP não encontrado."); return; }
      setFormData(prev => ({
        ...prev,
        Apr_Endereco: data.logradouro ?? prev.Apr_Endereco,
        Apr_Bairro: data.bairro ?? prev.Apr_Bairro,
        Apr_Cidade: data.localidade ?? prev.Apr_Cidade,
        Apr_UF: data.uf ?? prev.Apr_UF,
      }));
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      toast.error("Não foi possível consultar o CEP.");
    }
  }, [isEducadorAccess]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc]">
      <main className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {(isAdmin || isEducadorAccess) && (
                <button onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer">
                  <ArrowLeft size={32} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[#133c86]">
                  {isEducadorAccess ? "Consulta de Aprendiz" : (editingId ? "Edição de Aprendiz" : "Novo Aprendiz")}
                </h1>
                <p className="text-sm text-gray-500">
                  {formData.Apr_Nome || (editingId ? "Carregando..." : "Preencha os dados abaixo")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {canEditAprendiz && !editingId && rascunhoSalvoEm && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    Rascunho salvo às {rascunhoSalvoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button onClick={descartarRascunho}
                    className="text-xs text-red-400 hover:text-red-600 underline transition-colors">
                    Descartar
                  </button>
                </div>
              )}
              {isAdmin && canEditAprendiz && (
                <button onClick={() => router.back()}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-all">
                  Cancelar
                </button>
              )}
              {canEditAprendiz && (
                <button onClick={requestSave} disabled={loading}
                  className="px-5 py-2 bg-[#133c86] text-white rounded-lg font-bold hover:bg-[#0f2e6b] transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
                  {loading ? "Processando..." : (<><Save size={16} />{editingId ? "Atualizar" : "Salvar"}</>)}
                </button>
              )}
            </div>
          </div>
        </header>

        <div className={`p-6 mx-auto w-full ${activeTab === "calendario" ? "max-w-[1560px]" : "max-w-7xl"}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-1 flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#133c86] text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#133c86]"
                }`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-24">
            <fieldset disabled={isEducadorAccess} className="contents">
              {activeTab === "jovem"        && <TabJovem f={formData} hc={handleChange} unidades={unidades} instituicoes={instituicoes} escolas={escolas} turmas={turmas} situacoes={situacoes} areasAtuacao={areasAtuacao} planos={planos} motivos={motivos} onEscolaChange={onEscolaChange} escolaEndereco={escolaEndereco} cidades={cidades} onUFNatChange={onUFNatChange} confirmAprSenha={confirmAprSenha} onConfirmAprSenhaChange={handleConfirmAprSenhaChange} />}
              {/* {activeTab === "escolaridade" && <TabEscolaridade f={formData} hc={handleChange} />} */}
              {activeTab === "documentacao" && <TabDocumentacao f={formData} hc={handleChange} />}
              {activeTab === "endereco"     && <TabEndereco f={formData} hc={handleChange} buscaCEP={buscaCEP} />}
              {activeTab === "familiares"   && <TabFamiliares f={formData} hc={handleChange} />}
              {activeTab === "socio"        && <TabSocioEconomico f={formData} hc={handleChange} parentescos={parentescos} />}
              {activeTab === "saude"        && <TabSaude f={formData} hc={handleChange} />}
              {activeTab === "calendario"   && <CalendarioForm formData={formData} handleChange={handleChange} calFormData={calFormData} handleCalChange={handleCalChange} unidades={unidades} instituicoes={instituicoes} parceiros={parceiros} cursos={areasAtuacao} turmas={turmas} calendarMode={calendarMode} onCalendarModeChange={handleCalendarModeChange} />}
              {activeTab === "alocacoes"    && editingId && <TabAlocacao aprendizId={Number(editingId)} aprendizNome={formData.Apr_Nome || ""} turmas={turmas} motivos={motivos} />}
              {activeTab === "capacitacoes" && editingId && <TabCapacitacao aprendizId={Number(editingId)} turmas={TURMAS_ENC} unidades={unidades} />}
            </fieldset>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
            <button
              disabled={tabs.findIndex(t => t.id === activeTab) === 0}
              onClick={() => {
                const idx = tabs.findIndex(t => t.id === activeTab);
                if (idx > 0) { setActiveTab(tabs[idx - 1].id); window.scrollTo({ top: 0, behavior: "smooth" }); }
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-all disabled:opacity-30">
              <ArrowLeft size={16} /> Anterior
            </button>
            {tabs.findIndex(t => t.id === activeTab) < tabs.length - 1 ? (
              <button
                onClick={() => {
                  const idx = tabs.findIndex(t => t.id === activeTab);
                  setActiveTab(tabs[idx + 1].id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#133c86] text-white font-medium hover:bg-[#0f2e6b] transition-all">
                Próximo <div className="rotate-180"><ArrowLeft size={16} /></div>
              </button>
            ) : canEditAprendiz ? (
              <button onClick={requestSave} disabled={loading}
                className="flex items-center gap-2 px-8 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50">
                <Save size={16} /> {editingId ? "Finalizar Atualização" : "Finalizar Cadastro"}
              </button>
            ) : (
              <span className="text-sm font-semibold text-gray-500">Somente consulta</span>
            )}
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => { setShowSaveConfirm(false); handleSave(); }}
        title="Confirmar Atualização"
        message={`Deseja salvar as alterações no cadastro de ${formData.Apr_Nome || "este aprendiz"}?`}
        confirmText="Salvar"
        cancelText="Cancelar"
        loading={loading}
      />
    </div>
  );
}

export default function CadAprendizes() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#133c86]" />
      </div>
    }>
      <CadastroForm />
    </Suspense>
  );
}
