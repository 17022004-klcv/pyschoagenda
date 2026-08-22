import React from "react";
import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { UserAccount } from "@/types/user";
import { PdfLayout } from "./PdfLayout"; // Asegúrate de ajustar la ruta según tu proyecto

// Estilos específicos para la sección de usuarios
const styles = StyleSheet.create({
  // Tarjetas de Resumen (KPIs)
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flex: 1,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#64748B",
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 2,
  },

  // Estilos de la Tabla (Listado)
  table: {
    width: "100%",
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  colName: { width: "35%" },
  colEmail: { width: "30%" },
  colRole: { width: "20%" },
  colStatus: { width: "15%", textAlign: "right" },

  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  cellText: {
    fontSize: 9,
    color: "#334155",
  },
  cellSubtext: {
    fontSize: 7,
    color: "#94A3B8",
    marginTop: 2,
  },

  // Badges (Etiquetas de estado)
  badge: {
    fontSize: 7,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  badgeActive: {
    backgroundColor: "#ECFDF5",
    color: "#047857",
  },
  badgeInactive: {
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
  },

  // Ficha Individual (Single User)
  profileCard: {
    flexDirection: "row",
    gap: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  userEmail: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },

  gridDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  gridLabel: {
    fontSize: 8,
    color: "#64748B",
    textTransform: "uppercase",
  },
  gridValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 4,
  },
});

// Helper para formatear roles
const formatRole = (role: string) => {
  switch (role) {
    case "admin":
      return "Administrador";
    case "psychologist":
      return "Psicóloga";
    case "receptionist":
      return "Recepcionista";
    default:
      return role;
  }
};

// 📄 1. PDF PARA LISTADO DE USUARIOS
interface UsersListPDFProps {
  users: UserAccount[];
  filterTitle: string; // p. ej. "Todos los Usuarios", "Usuarios Activos" o "Usuarios Inactivos"
  showKPIs?: boolean; // Controla si se muestran las tarjetas KPI
}

export const UsersListPDF: React.FC<UsersListPDFProps> = ({
  users,
  filterTitle,
  showKPIs = false, // Por defecto solo se activará cuando sea "Todos"
}) => {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const inactiveUsers = users.filter((u) => u.status === "inactive").length;

  return (
    <PdfLayout
      title={filterTitle}
      subtitle="Reporte de Control de Usuarios y Accesos"
    >
      {/* Las KPIs solo se renderizan cuando showKPIs es true (Reporte de Todos) */}
      {showKPIs && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Registros</Text>
            <Text style={styles.summaryValue}>{totalUsers}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Activos</Text>
            <Text style={{ ...styles.summaryValue, color: "#059669" }}>
              {activeUsers}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Inactivos</Text>
            <Text style={{ ...styles.summaryValue, color: "#DC2626" }}>
              {inactiveUsers}
            </Text>
          </View>
        </View>
      )}

      {/* Tabla de Usuarios */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={styles.colName}>
            <Text style={styles.headerText}>Usuario</Text>
          </View>
          <View style={styles.colEmail}>
            <Text style={styles.headerText}>Contacto</Text>
          </View>
          <View style={styles.colRole}>
            <Text style={styles.headerText}>Rol</Text>
          </View>
          <View style={styles.colStatus}>
            <Text style={{ ...styles.headerText, textAlign: "right" }}>
              Estado
            </Text>
          </View>
        </View>

        {users.map((user) => (
          <View key={user.uid} style={styles.tableRow} wrap={false}>
            <View style={styles.colName}>
              <Text style={{ ...styles.cellText, fontWeight: "bold" }}>
                {user.name}
              </Text>
              <Text style={styles.cellSubtext}>
                Alta: {user.createdAt || "N/A"}
              </Text>
            </View>

            <View style={styles.colEmail}>
              <Text style={styles.cellText}>{user.email}</Text>
              <Text style={styles.cellSubtext}>
                Tel: {user.phone || "Sin registro"}
              </Text>
            </View>

            <View style={styles.colRole}>
              <Text style={styles.cellText}>{formatRole(user.role)}</Text>
            </View>

            <View style={styles.colStatus}>
              <Text
                style={{
                  ...styles.badge,
                  ...(user.status === "active"
                    ? styles.badgeActive
                    : styles.badgeInactive),
                }}
              >
                {user.status === "active" ? "ACTIVO" : "INACTIVO"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </PdfLayout>
  );
};

// 📄 2. PDF PARA FICHA INDIVIDUAL DE UN USUARIO
interface SingleUserPDFProps {
  user: UserAccount;
}

export const SingleUserPDF: React.FC<SingleUserPDFProps> = ({ user }) => {
  return (
    <PdfLayout
      title="Ficha de Usuario"
      subtitle={`Expediente de Personal - ID: ${user.uid.slice(0, 8)}`}
    >
      {/* Perfil del usuario */}
      <View style={styles.profileCard}>
        {user.photoURL && <Image src={user.photoURL} style={styles.avatar} />}
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={{ flexDirection: "row", marginTop: 6 }}>
            <Text
              style={{
                ...styles.badge,
                ...(user.status === "active"
                  ? styles.badgeActive
                  : styles.badgeInactive),
              }}
            >
              Cuenta {user.status === "active" ? "Activa" : "Inactiva"}
            </Text>
          </View>
        </View>
      </View>

      {/* Grilla de Datos */}
      <View style={styles.gridDetails}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Rol en la Clínica</Text>
          <Text style={styles.gridValue}>{formatRole(user.role)}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Teléfono de Contacto</Text>
          <Text style={styles.gridValue}>{user.phone || "No registrado"}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Fecha de Alta</Text>
          <Text style={styles.gridValue}>{user.createdAt || "N/A"}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Identificador Único</Text>
          <Text style={{ ...styles.gridValue, fontSize: 9 }}>{user.uid}</Text>
        </View>
      </View>
    </PdfLayout>
  );
};
