"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Student {
  IdAluno: number;
  NomeJovem: string;
  UnidadeParceiro: string;
}

interface PresencaData {
  turma: { nome: string; nucleo: string };
  students: Student[];
}

interface Props {
  presencaData: PresencaData;
  dataFormatada: string;
  diaSemana: string;
  disciplinaNome?: string;
}

const PAGE_SIZE = 22;

const s = StyleSheet.create({
  page: { padding: 24, fontFamily: "Helvetica", fontSize: 8, color: "#000" },
  center: { textAlign: "center" },
  bold: { fontFamily: "Helvetica-Bold" },
  header: { marginBottom: 8 },
  title: { fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "center" },
  subtitle: { fontSize: 7, textAlign: "center", color: "#444" },
  table: { marginTop: 6, borderStyle: "solid", borderColor: "#6b7280", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: "row" },
  infoRow: { flexDirection: "row", backgroundColor: "#d1d5db" },
  headRow: { flexDirection: "row", backgroundColor: "#1e3a6e" },
  cell: { borderStyle: "solid", borderColor: "#6b7280", borderWidth: 0, borderRightWidth: 1, borderBottomWidth: 1, padding: "3 4", justifyContent: "center" },
  headCell: { borderStyle: "solid", borderColor: "#6b7280", borderWidth: 0, borderRightWidth: 1, borderBottomWidth: 1, padding: "3 4", justifyContent: "center" },
  headText: { color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 7 },
  infoText: { fontFamily: "Helvetica-Bold", fontSize: 7.5 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, fontSize: 7 },
  signLine: { borderTopWidth: 1, borderColor: "#000", width: 120, marginBottom: 2 },
  colMatricula: { width: 42 },
  colNome: { flex: 1 },
  colUnidade: { width: 110 },
  colAula: { width: 32, textAlign: "center" },
  colAssinatura: { width: 72 },
});

function PresencaDocument({ presencaData, dataFormatada, diaSemana, disciplinaNome }: Props) {
  const pages = Array.from(
    { length: Math.ceil(presencaData.students.length / PAGE_SIZE) || 1 },
    (_, i) => presencaData.students.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE)
  );
  const today = format(new Date(), "dd/MM/yyyy", { locale: ptBR });

  return (
    <Document>
      {pages.map((pageStudents, pageIndex) => (
        <Page key={pageIndex} size="A4" style={s.page} orientation="landscape">
          {/* Cabeçalho */}
          <View style={s.header}>
            <Text style={s.title}>PROJOV SEDE</Text>
            <Text style={s.subtitle}>Rua Pará N°159, Bairro: Aldeia de Barueri, BARUERI - SP · CEP: 06440-130 · Tel: (11) 4166-2630</Text>
            <Text style={[s.title, { marginTop: 4 }]}>
              Lista de Presença — Aula do Dia {dataFormatada}
            </Text>
            {disciplinaNome ? (
              <Text style={[s.subtitle, { marginTop: 2 }]}>{disciplinaNome}</Text>
            ) : null}
          </View>

          {/* Tabela */}
          <View style={s.table}>
            {/* Linha de info da turma */}
            <View style={s.infoRow}>
              <View style={[s.cell, { flex: 1 }]}>
                <Text style={s.infoText}>
                  Turma: {presencaData.turma.nome}{"   "}
                  Núcleo: {presencaData.turma.nucleo}{"   "}
                  Dia do encontro: {diaSemana}
                </Text>
              </View>
            </View>

            {/* Cabeçalho das colunas */}
            <View style={s.headRow}>
              <View style={[s.headCell, s.colMatricula]}><Text style={s.headText}>Matrícula</Text></View>
              <View style={[s.headCell, s.colNome]}><Text style={s.headText}>Nome</Text></View>
              <View style={[s.headCell, s.colUnidade]}><Text style={s.headText}>Unidade Parceiro</Text></View>
              <View style={[s.headCell, s.colAula]}><Text style={s.headText}>1ª{"\n"}Aula</Text></View>
              <View style={[s.headCell, s.colAula]}><Text style={s.headText}>2ª{"\n"}Aula</Text></View>
              <View style={[s.headCell, s.colAula]}><Text style={s.headText}>3ª{"\n"}Aula</Text></View>
              <View style={[s.headCell, s.colAssinatura]}><Text style={s.headText}>Assinatura</Text></View>
              <View style={[s.headCell, s.colAssinatura]}><Text style={s.headText}>Assinatura</Text></View>
              <View style={[s.headCell, s.colAssinatura]}><Text style={s.headText}>Assinatura</Text></View>
            </View>

            {/* Linhas dos alunos */}
            {pageStudents.map((student, i) => (
              <View key={student.IdAluno} style={[s.tableRow, i % 2 === 1 ? { backgroundColor: "#f8fafc" } : {}]}>
                <View style={[s.cell, s.colMatricula]}><Text style={{ textAlign: "center" }}>{student.IdAluno}</Text></View>
                <View style={[s.cell, s.colNome]}><Text>{student.NomeJovem ?? ""}</Text></View>
                <View style={[s.cell, s.colUnidade]}><Text>{student.UnidadeParceiro ?? ""}</Text></View>
                <View style={[s.cell, s.colAula]}><Text> </Text></View>
                <View style={[s.cell, s.colAula]}><Text> </Text></View>
                <View style={[s.cell, s.colAula]}><Text> </Text></View>
                <View style={[s.cell, s.colAssinatura]}><Text> </Text></View>
                <View style={[s.cell, s.colAssinatura]}><Text> </Text></View>
                <View style={[s.cell, s.colAssinatura]}><Text> </Text></View>
              </View>
            ))}
          </View>

          {/* Rodapé */}
          <View style={s.footer}>
            <View>
              <View style={s.signLine} />
              <Text>Educador(a)</Text>
            </View>
            <Text>{today}</Text>
            <Text>Página {pageIndex + 1} de {pages.length}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}

export function BotaoBaixarPDF({ presencaData, dataFormatada, diaSemana, disciplinaNome }: Props) {
  const nomeArquivo = `lista-presenca-${presencaData.turma.nome.replace(/\s+/g, "-")}-${dataFormatada.replace(/\//g, "-")}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <PresencaDocument
          presencaData={presencaData}
          dataFormatada={dataFormatada}
          diaSemana={diaSemana}
          disciplinaNome={disciplinaNome}
        />
      }
      fileName={nomeArquivo}
      className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2 shadow-md active:scale-95"
    >
      {({ loading }) =>
        loading ? (
          "Preparando PDF..."
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar PDF
          </>
        )
      }
    </PDFDownloadLink>
  );
}
