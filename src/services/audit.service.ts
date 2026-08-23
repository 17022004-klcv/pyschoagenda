import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuditLogDocument, AuditLogUI } from "@/types/auditLog";

export const auditService = {
  async getLogs(maxResults = 100): Promise<AuditLogUI[]> {
    const logsRef = collection(db, "audit_logs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(maxResults));
    const snapshot = await getDocs(q);

    const logs: AuditLogUI[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as AuditLogDocument;

      const dateStr = data.timestamp?.toDate
        ? data.timestamp.toDate().toLocaleString()
        : new Date().toLocaleString();

      logs.push({
        id: docSnap.id,
        action: data.action || "INSERT",
        collectionName: data.collectionName || "users",
        documentId: data.documentId || "",
        performedBy: data.performedBy || {
          uid: "",
          name: "Sistema / Desconocido",
          email: "",
          role: "system",
        },
        details: data.details || "",
        timestamp: dateStr,
      });
    });

    return logs;
  },
};
