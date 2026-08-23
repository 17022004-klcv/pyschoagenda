import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { SessionData } from "@/types/session";
import { addDocWithLog, updateDocWithLog } from "@/lib/firestoreLogger";
import { UserContext } from "@/types/auditLog";

const SESSIONS_COLLECTION = "sessions";

export const sessionService = {
  // Guardar una nueva sesión (exige usuario obligatorio)
  async createSession(
    sessionData: Omit<SessionData, "id" | "createdAt">,
    user: UserContext,
  ) {
    if (!user || !user.uid) {
      throw new Error(
        "Se requiere un usuario autenticado válido para registrar el evento en la bitácora.",
      );
    }

    const patientDisplayName = sessionData.patientName || "Paciente";

    const docRef = await addDocWithLog(
      SESSIONS_COLLECTION,
      {
        ...sessionData,
        createdAt: serverTimestamp(),
      },
      user,
      `Nueva evolución/sesión clínica agregada para: ${patientDisplayName}`,
    );

    return { id: docRef.id, ...sessionData };
  },

  // Obtener el historial de sesiones de un paciente/expediente
  async getSessionsByPatient(patientId: string) {
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where("patientId", "==", patientId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as SessionData[];
  },

  // Obtener todas las sesiones
  async getAllSessions(): Promise<SessionData[]> {
    try {
      const sessionsRef = collection(db, SESSIONS_COLLECTION);
      const q = query(sessionsRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);

      const sessions: SessionData[] = [];
      querySnapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data(),
        } as SessionData);
      });

      return sessions;
    } catch (error) {
      console.error("Error al obtener todas las sesiones:", error);
      throw error;
    }
  },

  // Actualizar sesión (exige usuario obligatorio)
  async updateSession(
    id: string,
    data: Partial<SessionData>,
    user: UserContext,
  ): Promise<void> {
    if (!user || !user.uid) {
      throw new Error(
        "Se requiere un usuario autenticado válido para actualizar y registrar la auditoría.",
      );
    }

    await updateDocWithLog(
      SESSIONS_COLLECTION,
      id,
      data,
      user,
      `Sesión clínica/evolución (${id}) actualizada`,
    );
  },
};
