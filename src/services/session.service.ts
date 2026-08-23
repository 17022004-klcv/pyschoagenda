import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { SessionData } from "@/types/session";
import { addDocWithLog, updateDocWithLog } from "@/lib/firestoreLogger"; // 👈 Importado
import { UserContext } from "@/types/auditLog"; // 👈 Importado

const SESSIONS_COLLECTION = "sessions";

export const sessionService = {
  // Guardar una nueva sesión con bitácora
  async createSession(
    sessionData: Omit<SessionData, "id" | "createdAt">,
    user?: UserContext,
  ) {
    if (user) {
      const docRef = await addDocWithLog(
        SESSIONS_COLLECTION,
        {
          ...sessionData,
          createdAt: serverTimestamp(),
        },
        user,
        `Nueva evolución/sesión clínica agregada para: ${sessionData.patientName || "Paciente"}`,
      );
      return { id: docRef.id, ...sessionData };
    }

    const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), {
      ...sessionData,
      createdAt: serverTimestamp(),
    });
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

  // Actualizar sesión registrando en la bitácora
  async updateSession(
    id: string,
    data: Partial<SessionData>,
    user: UserContext,
  ): Promise<void> {
    await updateDocWithLog(
      SESSIONS_COLLECTION,
      id,
      data,
      user,
      `Sesión clínica/evolución (${id}) actualizada`,
    );
  },
};
