import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

import { SessionData } from "@/types/session";

const SESSIONS_COLLECTION = "sessions";

export const sessionService = {
  // Guardar una nueva sesión
  async createSession(sessionData: Omit<SessionData, "id" | "createdAt">) {
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
      const sessionsRef = collection(db, "sessions");

      // Ordenar por fecha o fecha de creación si es posible
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

  async updateSession(
    sessionId: string,
    data: Partial<SessionData>,
  ): Promise<void> {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      await updateDoc(sessionRef, data);
    } catch (error) {
      console.error("Error al actualizar la sesión:", error);
      throw error;
    }
  },
};
