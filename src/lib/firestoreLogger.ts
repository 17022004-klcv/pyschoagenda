import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  WithFieldValue,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logAuditEvent } from "@/services/logger.service";
import { AuditCollection } from "@/types/auditLog";

interface UserContext {
  uid: string;
  name: string;
  email: string;
  role: string;
}

// 1. Inserción con auditoría integrada
export async function addDocWithLog(
  collectionName: AuditCollection,
  data: WithFieldValue<DocumentData>,
  user: UserContext,
  details?: string,
) {
  const docRef = await addDoc(collection(db, collectionName), data);

  await logAuditEvent({
    action: "INSERT",
    collectionName,
    documentId: docRef.id,
    performedBy: user,
    details: details || `Nuevo registro en ${collectionName}`,
    newData: data as Record<string, any>,
  });

  return docRef;
}

// 2. Edición con auditoría integrada
export async function updateDocWithLog(
  collectionName: AuditCollection,
  documentId: string,
  data: WithFieldValue<DocumentData>,
  user: UserContext,
  details?: string,
) {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, data);

  await logAuditEvent({
    action: "UPDATE",
    collectionName,
    documentId,
    performedBy: user,
    details: details || `Actualización en ${collectionName}`,
    newData: data as Record<string, any>,
  });
}

// 3. Eliminación con auditoría integrada
export async function deleteDocWithLog(
  collectionName: AuditCollection,
  documentId: string,
  user: UserContext,
  details?: string,
) {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);

  await logAuditEvent({
    action: "DELETE",
    collectionName,
    documentId,
    performedBy: user,
    details: details || `Eliminación en ${collectionName}`,
  });
}
