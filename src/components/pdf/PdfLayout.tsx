import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    height: 6,
    backgroundColor: "#0284C7",
    marginBottom: 15,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
    marginBottom: 15,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 6,
    objectFit: "contain",
  },
  clinicName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0284C7",
    letterSpacing: 0.3,
  },
  subTitle: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 2,
  },
  badgeDate: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    textAlign: "right",
  },
  dateText: {
    fontSize: 8,
    color: "#0369A1",
    fontWeight: "bold",
  },
  documentHeader: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  documentTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0F172A",
    textTransform: "uppercase",
  },
  documentSub: {
    fontSize: 8,
    color: "#64748B",
  },
  content: {
    flex: 1,
  },

  // 🟢 BLOQUE DE FIRMAS/SELLO EN LA MISMA LÍNEA HORIZONTAL
  footerSignatureRow: {
    flexDirection: "row",
    justifyContent: "flex-end", // Si no hay firma a la izquierda, manda el sello a la derecha
    alignItems: "flex-end",
    marginTop: 15,
    marginBottom: 5,
  },
  stampBox: {
    width: 160,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#94A3B8",
    paddingTop: 4,
  },
  stampImage: {
    height: 45,
    width: 90,
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
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#94A3B8",
  },
});

interface PdfLayoutProps {
  title: string;
  subtitle?: string;
  showStamp?: boolean; // Permite apagarlo en consentimientos
  children: React.ReactNode;
}

export const PdfLayout = ({
  title,
  subtitle = "CENTRO PSICOLÓGICO INTEGRAL",
  showStamp = true,
  children,
}: PdfLayoutProps) => {
  const logoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/logo.png`
      : "/logo.png";

  const stampUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sello.png`
      : "/sello.png";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topBar} />

        <View style={styles.header}>
          <View style={styles.brandGroup}>
            <Image src={logoUrl} style={styles.logo} />
            <View>
              <Text style={styles.clinicName}>CENTRO PSICOLÓGICO</Text>
              <Text style={styles.subTitle}>{subtitle}</Text>
            </View>
          </View>

          <View style={styles.badgeDate}>
            <Text style={styles.dateText}>
              Emisión: {new Date().toLocaleDateString("es-SV")}
            </Text>
          </View>
        </View>

        <View style={styles.documentHeader}>
          <Text style={styles.documentTitle}>{title}</Text>
          <Text style={styles.documentSub}>
            Documento Oficial de Expediente
          </Text>
        </View>

        {/* Contenido Dinámico */}
        <View style={styles.content}>{children}</View>

        {/* 🟢 SELLO INSTITUCIONAL A LA DERECHA */}
        {showStamp && (
          <View style={styles.footerSignatureRow}>
            <View style={styles.stampBox}>
              <Image src={stampUrl} style={styles.stampImage} />
              <Text style={styles.signatoryTitle}>
                Centro Psicológico Integral
              </Text>
              <Text style={styles.signatorySub}>
                Sello e Identificación Institucional
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Este documento contiene información médica confidencial protegida.
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
