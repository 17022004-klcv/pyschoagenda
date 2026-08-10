import React from "react";
import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { PdfLayout } from "./PdfLayout";
import { Patient } from "@/services/patient.service";

const styles = StyleSheet.create({
  boxSection: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0284C7",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  // 🟢 Estilos agregados que faltaban para la sección 1
  paragraph: {
    fontSize: 8,
    color: "#334155",
    lineHeight: 1.5,
    textAlign: "justify",
  },
  bold: {
    fontWeight: "bold",
    color: "#0F172A",
  },
  legalText: {
    fontSize: 8,
    color: "#334155",
    lineHeight: 1.5,
    marginBottom: 8,
    textAlign: "justify",
  },
  boldText: {
    fontWeight: "bold",
    color: "#0F172A",
  },
  bulletList: {
    marginLeft: 10,
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 8,
    color: "#334155",
    marginBottom: 3,
  },
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 30,
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
  },
  signatorySub: {
    fontSize: 7,
    color: "#64748B",
    textAlign: "center",
  },
});

interface ConsentPdfProps {
  patient: Patient;
}

export const ConsentPdfDocument = ({ patient }: ConsentPdfProps) => {
  const isMinor = Boolean(patient.isMinor && patient.tutor);

  // Datos dinámicos del Declarante (Quien firma)
  const declarantName = isMinor ? patient.tutor?.name : patient.name;
  const declarantDui = isMinor ? patient.tutor?.dui : patient.dui || "N/A";
  const declarantQuality = isMinor
    ? `Tutor / Encargado Legal (${patient.tutor?.relationship})`
    : "Paciente (Mayor de Edad)";

  const signerName = declarantName;
  const signerDui = declarantDui;

  const stampUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sello.png`
      : "/sello.png";

  return (
    <PdfLayout
      title="CONSENTIMIENTO INFORMADO PARA ATENCIÓN PSICOLÓGICA"
      subtitle="DOCUMENTO LEGAL Y CLÍNICO OFICIAL"
      showStamp={false}
    >
      {/* Información de Identificación */}
      <View style={styles.boxSection}>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>1. DECLARACIÓN DE IDENTIDAD</Text>
          {"\n"}
          Yo, <Text style={styles.bold}>{declarantName}</Text>, identificado(a)
          con documento de identidad / DUI N°{" "}
          <Text style={styles.bold}>{declarantDui}</Text>, actuando en calidad
          de <Text style={styles.bold}>{declarantQuality}</Text>
          {isMinor && (
            <>
              {" "}
              del paciente <Text style={styles.bold}>{patient.name}</Text>
            </>
          )}{" "}
          (Edad: <Text style={styles.bold}>{patient.age} años</Text>), otorgo de
          manera libre y voluntaria el presente consentimiento.
        </Text>
      </View>

      {/* Términos Legales y Clínicos */}
      <View style={styles.boxSection}>
        <Text style={styles.sectionTitle}>
          2. Acuerdos y Condiciones del Servicio
        </Text>

        <Text style={styles.legalText}>
          Por medio de este documento, declaro haber sido informado(a)
          adecuadamente sobre las características del proceso de atención
          psicológica y acepto los siguientes puntos:
        </Text>

        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>
            • <Text style={styles.boldText}>Confidencialidad:</Text> Toda la
            información compartida durante las sesiones es estrictamente
            confidencial, protegida por el secreto profesional, salvo en
            situaciones donde exista riesgo inminente para la vida de la persona
            o terceros.
          </Text>
          <Text style={styles.bulletItem}>
            • <Text style={styles.boldText}>Voluntariedad:</Text> Tengo el
            derecho de interrumpir o finalizar el proceso de atención
            psicológica en el momento que lo considere conveniente.
          </Text>
          <Text style={styles.bulletItem}>
            • <Text style={styles.boldText}>Compromiso:</Text> Me comprometo a
            asistir puntualmente a las citas programadas y seguir las
            recomendaciones brindadas por el profesional tratante.
          </Text>
        </View>
      </View>

      {/* Áreas de Firma y Sello */}
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
          {patient.consentDate && (
            <Text style={[styles.signatorySub, { marginTop: 2 }]}>
              Firmado el: {patient.consentDate}
            </Text>
          )}
        </View>

        {/* Firma y Sello de la Institución */}
        <View style={styles.signatureBox}>
          <Image src={stampUrl} style={styles.stampImage} />

          <Text style={styles.signatoryTitle}>Centro Psicológico Integral</Text>
          <Text style={styles.signatorySub}>
            Recepción / Profesional Autorizado
          </Text>
          <Text style={styles.signatorySub}>
            Sello e Identificación Institucional
          </Text>
        </View>
      </View>
    </PdfLayout>
  );
};
