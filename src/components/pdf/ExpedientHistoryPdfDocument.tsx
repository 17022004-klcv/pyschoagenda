import React from "react";
import { Document, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PdfLayout } from "./PdfLayout";
import { SessionData } from "@/types/session";

const styles = StyleSheet.create({
  filterBadge: {
    marginBottom: 10,
    fontSize: 8,
    color: "#0369A1",
    backgroundColor: "#F0F9FF",
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  // Columnas proporcionales para el historial
  colCode: { width: "18%" },
  colDate: { width: "15%" },
  colPatient: { width: "27%" },
  colTherapy: { width: "20%" },
  colTheme: { width: "20%" },

  headerText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  cellText: {
    fontSize: 8,
    color: "#1E293B",
  },
  subCellText: {
    fontSize: 7,
    color: "#64748B",
  },
});

interface ExpedientHistoryPdfProps {
  sessions: SessionData[];
  filterLabel: string;
}

export const ExpedientHistoryPdfDocument = ({
  sessions,
  filterLabel,
}: ExpedientHistoryPdfProps) => (
  <Document title="Historial_de_Sesiones_y_Expedientes">
    <PdfLayout
      title="Historial de Sesiones y Expedientes"
      subtitle="REGISTRO CLÍNICO INTEGRAL"
      showStamp={true}
    >
      {/* Banner de Filtros */}
      <View style={styles.filterBadge}>
        <Text>
          Filtro Aplicado:{" "}
          <Text style={{ fontWeight: "bold" }}>{filterLabel}</Text> | Total de
          sesiones:{" "}
          <Text style={{ fontWeight: "bold" }}>{sessions.length}</Text>
        </Text>
      </View>

      {/* Tabla de Resultados */}
      <View style={styles.table}>
        {/* Encabezados */}
        <View style={styles.tableHeader}>
          <View style={styles.colCode}>
            <Text style={styles.headerText}>Cod. Exp.</Text>
          </View>
          <View style={styles.colDate}>
            <Text style={styles.headerText}>Fecha</Text>
          </View>
          <View style={styles.colPatient}>
            <Text style={styles.headerText}>Paciente(s)</Text>
          </View>
          <View style={styles.colTherapy}>
            <Text style={styles.headerText}>Tipo Terapia</Text>
          </View>
          <View style={styles.colTheme}>
            <Text style={styles.headerText}>Tema Tratado</Text>
          </View>
        </View>

        {/* Filas Dinámicas */}
        {sessions.length === 0 ? (
          <View style={styles.tableRow}>
            <Text style={[styles.cellText, { color: "#94A3B8" }]}>
              No hay sesiones registradas que coincidan con los criterios.
            </Text>
          </View>
        ) : (
          sessions.map((session, index) => (
            <View style={styles.tableRow} key={session.id || `row-${index}`}>
              <View style={styles.colCode}>
                <Text
                  style={[
                    styles.cellText,
                    { fontWeight: "bold", color: "#0284C7" },
                  ]}
                >
                  {session.expedientCode || "N/A"}
                </Text>
              </View>
              <View style={styles.colDate}>
                <Text style={styles.cellText}>{session.date || "-"}</Text>
              </View>
              <View style={styles.colPatient}>
                <Text style={[styles.cellText, { fontWeight: "bold" }]}>
                  {session.patientName || "Paciente sin nombre"}
                </Text>
              </View>
              <View style={styles.colTherapy}>
                <Text style={styles.cellText}>
                  {session.therapyType || "-"}
                </Text>
              </View>
              <View style={styles.colTheme}>
                <Text style={styles.subCellText}>{session.theme || "-"}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </PdfLayout>
  </Document>
);
