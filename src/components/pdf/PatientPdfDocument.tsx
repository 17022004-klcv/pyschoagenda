import React from "react";
import { Document, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
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
    minHeight: 50,
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
    alignItems: "flex-end",
    marginTop: 25,
    paddingHorizontal: 20,
  },
  signatureBox: {
    width: "45%",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#94A3B8",
    paddingTop: 6,
    position: "relative",
  },
  signatureImage: {
    height: 45,
    width: 130,
    objectFit: "contain",
    marginBottom: 4,
  },
  stampImage: {
    height: 55,
    width: 110,
    objectFit: "contain",
    marginBottom: 2,
  },
  signatoryTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
  },
  signatorySub: {
    fontSize: 7,
    color: "#64748B",
    textAlign: "center",
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
    consentSignature?: string;
    consentDate?: string;
    tutor?: {
      name: string;
      relationship: string;
      dui: string;
      phone: string;
    };
  };
}

export const PatientPdfDocument = ({ patient }: PatientPdfProps) => {
  const isMinor = Boolean(patient.isMinor && patient.tutor);
  const signerName = isMinor ? patient.tutor?.name : patient.name;
  const signerDui = isMinor ? patient.tutor?.dui : patient.dui || "N/A";

  const stampUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sello.png`
      : "/sello.png";

  return (
    <Document title={`Ficha_Paciente_${patient.name.replace(/\s+/g, "_")}`}>
      <PdfLayout
        title="Ficha de Identificación del Paciente"
        subtitle="INTEGRAL SENSUNTEPEQUE"
        showStamp={false}
      >
        {/* 📋 Bloque 1: Datos Personales */}
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
              <Text style={styles.value}>{patient.gender || "—"}</Text>
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
              <Text style={styles.value}>{patient.phone || "—"}</Text>
            </View>

            <View style={styles.col2}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <Text style={styles.value}>
                {patient.email || "No registrado"}
              </Text>
            </View>
          </View>
        </View>

        {/* 🛡️ Bloque 3: Datos de Tutor (Si aplica) */}
        {isMinor && patient.tutor && (
          <View style={styles.cardSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                3. Responsable Legal / Tutor
              </Text>
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

        {/* 📝 Bloque 4: Notas / Observaciones */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isMinor
                ? "4. Observaciones Médicas / Recepción"
                : "3. Observaciones Médicas / Recepción"}
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

        {/* ✍️ BLOQUE DE FIRMAS Y SELLO */}
        <View style={styles.signatureContainer}>
          {/* Firma Paciente / Tutor */}
          <View style={styles.signatureBox}>
            {patient.consentSignature ? (
              <Image
                src={patient.consentSignature}
                style={styles.signatureImage}
              />
            ) : (
              <View style={{ height: 45 }} />
            )}
            <Text style={styles.signatoryTitle}>{signerName}</Text>
            <Text style={styles.signatorySub}>
              Firma de {isMinor ? "Tutor Responsable" : "Paciente"}
            </Text>
            <Text style={styles.signatorySub}>DUI: {signerDui}</Text>
          </View>

          {/* Firma y Sello Institucional */}
          <View style={styles.signatureBox}>
            <Image src={stampUrl} style={styles.stampImage} />
            <Text style={styles.signatoryTitle}>
              Centro Psicológico Integral
            </Text>
            <Text style={styles.signatorySub}>
              Recepción / Profesional Autorizado
            </Text>
            <Text style={styles.signatorySub}>
              Sello e Identificación Institucional
            </Text>
          </View>
        </View>
      </PdfLayout>
    </Document>
  );
};
