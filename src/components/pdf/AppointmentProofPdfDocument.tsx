import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { SessionData } from "@/types/session";
import { PdfLayout } from "./PdfLayout";

const styles = StyleSheet.create({
  docTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginVertical: 15,
    letterSpacing: 0.8,
    color: "#0F172A",
  },
  body: {
    lineHeight: 1.6,
    textAlign: "justify",
    fontSize: 9.5,
    color: "#334155",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  bold: {
    fontWeight: "bold",
    color: "#0F172A",
  },
});

interface Props {
  session: SessionData;
  patientName: string;
}

export const AppointmentProofPdfDocument: React.FC<Props> = ({
  session,
  patientName,
}) => {
  const sessionTime = (session as SessionData & { time?: string }).time;

  return (
    <PdfLayout
      title="Constancia de Atención"
      subtitle="DOCUMENTO DE ASISTENCIA"
    >
      <Text style={styles.docTitle}>A QUIEN CORRESPONDA</Text>

      <View style={styles.body}>
        <Text>
          Por medio de la presente se hace constar que el/la paciente{" "}
          <Text style={styles.bold}>{patientName}</Text> asistió a su sesión de{" "}
          <Text style={styles.bold}>{session.therapyType}</Text> el día{" "}
          <Text style={styles.bold}>{session.date}</Text>
          {sessionTime ? ` a las ${sessionTime}` : ""}, registrada bajo el
          código de expediente{" "}
          <Text style={styles.bold}>{session.expedientCode || "N/A"}</Text>.
        </Text>

        <Text style={{ marginTop: 12 }}>
          Se extiende la presente constancia a solicitud de la parte interesada
          para los fines que considere convenientes.
        </Text>
      </View>
    </PdfLayout>
  );
};
