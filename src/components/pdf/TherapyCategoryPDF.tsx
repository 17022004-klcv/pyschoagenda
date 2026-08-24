import React from "react";
import { Document, Text, View, StyleSheet } from "@react-pdf/renderer";
import { TherapyCategory } from "@/types/therapyCategory";
import { PdfLayout } from "./PdfLayout";

const styles = StyleSheet.create({
  table: { marginTop: 10 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 6,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#F8FAFC",
    fontWeight: "bold",
    borderBottomColor: "#CBD5E1",
  },
  colIndex: { width: "10%", textAlign: "center", color: "#64748B" },
  colName: { width: "50%", color: "#0F172A", fontWeight: "bold" },
  colStatus: { width: "20%", textAlign: "center" },
  colDate: { width: "20%", textAlign: "center", color: "#64748B" },

  // Estilos Ficha Individual
  detailBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  label: { width: "35%", fontWeight: "bold", color: "#475569" },
  value: { width: "65%", color: "#0F172A" },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
  },
  activeText: { color: "#047857" },
  inactiveText: { color: "#B91C1C" },
});

// 📄 PDF Lista General o Filtrada
export const CategoriesListPDF = ({
  categories,
  filterTitle,
}: {
  categories: TherapyCategory[];
  filterTitle: string;
}) => (
  <Document title={`Reporte_Categorias_${filterTitle.replace(/\s+/g, "_")}`}>
    <PdfLayout
      title={`Reporte de Categorías (${filterTitle})`}
      subtitle="LISTADO GENERAL DE CATEGORÍAS REGISTRADAS"
      showStamp={true}
    >
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.colIndex}>#</Text>
          <Text style={styles.colName}>Categoría de Terapia</Text>
          <Text style={styles.colStatus}>Estado</Text>
          <Text style={styles.colDate}>Fecha Alta</Text>
        </View>

        {categories.length === 0 ? (
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.colName,
                { color: "#94A3B8", width: "100%", textAlign: "center" },
              ]}
            >
              No hay categorías registradas.
            </Text>
          </View>
        ) : (
          categories.map((cat, index) => (
            <View key={cat.id || `cat-${index}`} style={styles.tableRow}>
              <Text style={styles.colIndex}>{index + 1}</Text>
              <Text style={styles.colName}>{cat.name}</Text>
              <Text
                style={[
                  styles.colStatus,
                  styles.statusBadge,
                  cat.status === "active"
                    ? styles.activeText
                    : styles.inactiveText,
                ]}
              >
                {cat.status === "active" ? "Activo" : "Inactivo"}
              </Text>
              <Text style={styles.colDate}>{cat.createdAt || "-"}</Text>
            </View>
          ))
        )}
      </View>
    </PdfLayout>
  </Document>
);

// 📄 PDF Ficha Individual
export const SingleCategoryPDF = ({
  category,
}: {
  category: TherapyCategory;
}) => (
  <Document title={`Ficha_Categoria_${category.name.replace(/\s+/g, "_")}`}>
    <PdfLayout
      title="Ficha de Categoría de Terapia"
      subtitle="DETALLE TÉCNICO DE ESPECIALIDAD"
      showStamp={true}
    >
      <View style={styles.detailBox}>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>ID de Registro:</Text>
          <Text style={styles.value}>{category.id || "N/A"}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Nombre de Categoría:</Text>
          <Text style={styles.value}>{category.name}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Estado del Registro:</Text>
          <Text
            style={[
              styles.value,
              category.status === "active"
                ? styles.activeText
                : styles.inactiveText,
              { fontWeight: "bold" },
            ]}
          >
            {category.status === "active" ? "ACTIVO" : "INACTIVO"}
          </Text>
        </View>
        <View
          style={[styles.fieldRow, { borderBottomWidth: 0, marginBottom: 0 }]}
        >
          <Text style={styles.label}>Fecha de Alta:</Text>
          <Text style={styles.value}>{category.createdAt || "-"}</Text>
        </View>
      </View>
    </PdfLayout>
  </Document>
);
