import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { PdfLayout } from "./PdfLayout";
import { Patient } from "@/services/patient.service";

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
  colName: { width: "35%" },
  colGender: { width: "15%" },
  colAge: { width: "12%" },
  colPhone: { width: "20%" },
  colStatus: { width: "18%" },

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

interface PatientListPdfProps {
  patients: Patient[];
  filterLabel: string;
}

export const PatientListPdfDocument = ({
  patients,
  filterLabel,
}: PatientListPdfProps) => (
  <PdfLayout
    title="Reporte General de Pacientes"
    subtitle="LISTADO GENERAL DE EXPEDIENTES"
    showStamp={true} // 🟢 Habilitamos el sello para esta lista
  >
    <View style={styles.filterBadge}>
      <Text>
        Filtro Aplicado:{" "}
        <Text style={{ fontWeight: "bold" }}>{filterLabel}</Text> | Total de
        registros: <Text style={{ fontWeight: "bold" }}>{patients.length}</Text>
      </Text>
    </View>

    <View style={styles.table}>
      {/* Encabezado Tabla */}
      <View style={styles.tableHeader}>
        <View style={styles.colName}>
          <Text style={styles.headerText}>Paciente</Text>
        </View>
        <View style={styles.colGender}>
          <Text style={styles.headerText}>Género</Text>
        </View>
        <View style={styles.colAge}>
          <Text style={styles.headerText}>Edad</Text>
        </View>
        <View style={styles.colPhone}>
          <Text style={styles.headerText}>Teléfono</Text>
        </View>
        <View style={styles.colStatus}>
          <Text style={styles.headerText}>Estado</Text>
        </View>
      </View>

      {/* Filas */}
      {patients.length === 0 ? (
        <View style={styles.tableRow}>
          <Text style={[styles.cellText, { color: "#94A3B8" }]}>
            No hay pacientes que coincidan con el filtro seleccionador.
          </Text>
        </View>
      ) : (
        patients.map((p) => (
          <View style={styles.tableRow} key={p.id}>
            <View style={styles.colName}>
              <Text style={[styles.cellText, { fontWeight: "bold" }]}>
                {p.name}
              </Text>
              <Text style={styles.subCellText}>
                {p.isMinor
                  ? `Tutor: ${p.tutor?.name}`
                  : `DUI: ${p.dui || "N/A"}`}
              </Text>
            </View>
            <View style={styles.colGender}>
              <Text style={styles.cellText}>{p.gender}</Text>
            </View>
            <View style={styles.colAge}>
              <Text style={styles.cellText}>{p.age} años</Text>
            </View>
            <View style={styles.colPhone}>
              <Text style={styles.cellText}>{p.phone}</Text>
            </View>
            <View style={styles.colStatus}>
              <Text
                style={[
                  styles.cellText,
                  {
                    fontWeight: "bold",
                    color: p.status === "Activo" ? "#047857" : "#64748B",
                  },
                ]}
              >
                {p.status}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  </PdfLayout>
);
