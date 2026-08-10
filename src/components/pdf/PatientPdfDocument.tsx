import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { PdfLayout } from "./PdfLayout";

const styles = StyleSheet.create({
  cardSection: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0284C7",
    textTransform: "uppercase",
  },
  grid4: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  col3: {
    width: "33.33%",
    paddingRight: 6,
  },
  col2: {
    width: "50%",
    paddingRight: 6,
  },
  col1: {
    width: "100%",
  },
  label: {
    fontSize: 7,
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 2,
    fontWeight: "bold",
  },
  value: {
    fontSize: 9,
    color: "#0F172A",
    fontWeight: "bold",
  },
  statusBadge: {
    backgroundColor: "#ECFDF5",
    color: "#047857",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 8,
    alignSelf: "flex-start",
  },
  notesBox: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 6,
    padding: 8,
    marginTop: 5,
  },
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    paddingHorizontal: 30,
  },
  signatureBox: {
    width: "40%",
    borderTopWidth: 1,
    borderTopColor: "#94A3B8",
    alignItems: "center",
    paddingTop: 4,
  },
  signatureText: {
    fontSize: 8,
    color: "#475569",
    fontWeight: "bold",
  },
  signatureSub: {
    fontSize: 7,
    color: "#94A3B8",
  },
});

interface PatientPdfProps {
  patient: {
    id: string;
    name: string;
    gender: string;
    birthDate: string;
    age: number;
    dui?: string;
    phone: string;
    email?: string;
    status: string;
    isMinor: boolean;
    observations?: string;
    tutor?: {
      name: string;
      relationship: string;
      dui: string;
      phone: string;
    };
  };
}

export const PatientPdfDocument = ({ patient }: PatientPdfProps) => (
  <PdfLayout
    title="Ficha de Identificación del Paciente"
    subtitle="INTEGRAL SENSUNTEPEQUE"
    showStamp={false}
  >
    {/* 📋 Bloque 1: Datos Personales Principales (3 Columnas) */}
    <View style={styles.cardSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>1. Información Personal</Text>
      </View>

      <View style={styles.grid4}>
        <View style={styles.col2}>
          <Text style={styles.label}>Nombre Completo</Text>
          <Text style={styles.value}>{patient.name}</Text>
        </View>

        <View style={styles.col3}>
          <Text style={styles.label}>Género</Text>
          <Text style={styles.value}>{patient.gender}</Text>
        </View>

        <View style={styles.col3}>
          <Text style={styles.label}>Fecha de Nacimiento</Text>
          <Text style={styles.value}>{patient.birthDate || "—"}</Text>
        </View>

        <View style={styles.col3}>
          <Text style={styles.label}>Edad Calculada</Text>
          <Text style={styles.value}>{patient.age} años</Text>
        </View>

        <View style={styles.col3}>
          <Text style={styles.label}>DUI / Documento</Text>
          <Text style={styles.value}>
            {patient.dui || "N/A (Menor de edad)"}
          </Text>
        </View>

        <View style={styles.col3}>
          <Text style={styles.label}>Estado del Paciente</Text>
          <Text style={styles.statusBadge}>{patient.status}</Text>
        </View>
      </View>
    </View>
    {/* 📞 Bloque 2: Información de Contacto */}
    <View style={styles.cardSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>2. Datos de Contacto</Text>
      </View>

      <View style={styles.grid4}>
        <View style={styles.col2}>
          <Text style={styles.label}>Teléfono Principal</Text>
          <Text style={styles.value}>{patient.phone}</Text>
        </View>

        <View style={styles.col2}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <Text style={styles.value}>{patient.email || "No registrado"}</Text>
        </View>
      </View>
    </View>
    {/* 🛡️ Bloque 3: Datos de Tutor (Si aplica) */}
    {patient.isMinor && patient.tutor && (
      <View style={styles.cardSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>3. Responsable Legal / Tutor</Text>
        </View>

        <View style={styles.grid4}>
          <View style={styles.col2}>
            <Text style={styles.label}>Nombre del Responsable</Text>
            <Text style={styles.value}>{patient.tutor.name}</Text>
          </View>

          <View style={styles.col3}>
            <Text style={styles.label}>Parentesco</Text>
            <Text style={styles.value}>{patient.tutor.relationship}</Text>
          </View>

          <View style={styles.col3}>
            <Text style={styles.label}>DUI Tutor</Text>
            <Text style={styles.value}>{patient.tutor.dui}</Text>
          </View>

          <View style={styles.col3}>
            <Text style={styles.label}>Teléfono Tutor</Text>
            <Text style={styles.value}>{patient.tutor.phone}</Text>
          </View>
        </View>
      </View>
    )}
    {/* 📝 Bloque 4: Notas / Observaciones Iniciales (Rellena espacio útil) */}
    // Dentro de PatientPdfDocument.tsx:
    <View style={styles.cardSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          4. Observaciones Médicas / Recepción
        </Text>
      </View>
      <View style={styles.notesBox}>
        <Text
          style={{
            fontSize: 8,
            color: patient.observations ? "#0F172A" : "#94A3B8",
          }}
        >
          {patient.observations ||
            "[ Sin observaciones adicionales registradas ]"}
        </Text>
      </View>
    </View>
    {/* ✍️ Firmas al Pie */}
    <View style={styles.signatureContainer}>
      <View style={styles.signatureBox}>
        <Text style={styles.signatureText}>Firma del Encargado / Paciente</Text>
        <Text style={styles.signatureSub}>Conformidad de Datos</Text>
      </View>
    </View>
  </PdfLayout>
);
