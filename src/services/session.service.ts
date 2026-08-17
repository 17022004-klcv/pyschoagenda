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
};
