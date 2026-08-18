import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { SessionData } from "@/types/session";
import { PdfLayout } from "./PdfLayout";

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  fieldCol: {
    width: "50%",
    marginBottom: 6,
  },
  label: {
    fontSize: 7,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  value: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 1,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0284C7",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 2,
    marginBottom: 4,
  },
  box: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    lineHeight: 1.3,
    fontSize: 8.5,
  },
});

interface Props {
  session: SessionData;
  patientName: string;
}

export const SessionDetailPdfDocument: React.FC<Props> = ({
  session,
  patientName,
}) => (
  <PdfLayout
    title="Detalle de Sesión Clínica"
    subtitle="REGISTRO DE EXPEDIENTE"
  >
    <View style={styles.grid}>
      <View style={styles.fieldCol}>
        <Text style={styles.label}>Paciente(s)</Text>
        <Text style={styles.value}>{patientName}</Text>
      </View>
      <View style={styles.fieldCol}>
        <Text style={styles.label}>Tipo de Terapia</Text>
        <Text style={styles.value}>{session.therapyType}</Text>
      </View>
      <View style={styles.fieldCol}>
        <Text style={styles.label}>Fecha de la Sesión</Text>
        <Text style={styles.value}>{session.date}</Text>
      </View>
      <View style={styles.fieldCol}>
        <Text style={styles.label}>Código de Expediente</Text>
        <Text style={styles.value}>{session.expedientCode || "N/A"}</Text>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tema Tratado</Text>
      <View style={styles.box}>
        <Text>{session.theme || "Sin tema registrado."}</Text>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Resumen de la Sesión</Text>
      <View style={styles.box}>
        <Text>{session.summary || "Sin resumen registrado."}</Text>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Análisis Clínico</Text>
      <View style={styles.box}>
        <Text>{session.analysis || "Sin análisis clínico registrado."}</Text>
      </View>
    </View>
  </PdfLayout>
);
