import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuditAction, AuditCollection } from "@/types/auditLog";

interface LogEventParams {
  action: AuditAction;
  collectionName: AuditCollection;
  documentId: string;
  performedBy: {
    uid: string;
    name: string;
    email: string;
    role: string;
  };
  details?: string;
  previousData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
}

export async function logAuditEvent(params: LogEventParams) {
  try {
    const logsRef = collection(db, "audit_logs");
    await addDoc(logsRef, {
      ...params,
      details: params.details || `${params.action} en ${params.collectionName}`,
      previousData: params.previousData || null,
      newData: params.newData || null,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al registrar evento en bitácora:", error);
  }
}
