import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { addDocWithLog } from "@/lib/firestoreLogger";
import { UserContext } from "@/types/auditLog";

// Auxiliar: Generar iniciales de un nombre
function getInitials(fullName: string): string {
  if (!fullName) return "";
  const words = fullName.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export const ExpedientService = {
  /**
   * Genera el código correlativo según las iniciales de los integrantes (ej. JCMP001)
   */
  async generateCode(patientNames: string[]): Promise<string> {
    const combinedInitials = patientNames
      .map((name) => getInitials(name))
      .join("");

    const baseCode = combinedInitials || "EXP";

    const expedientsRef = collection(db, "expedients");
    const q = query(
      expedientsRef,
      where("code", ">=", baseCode),
      where("code", "<=", baseCode + "\uf8ff"),
    );

    const snapshot = await getDocs(q);
    const count = snapshot.size + 1;
    const paddedNumber = String(count).padStart(3, "0");

    return `${baseCode}${paddedNumber}`;
  },

  /**
   * Obtiene o crea un expediente para una lista de pacientes registrando en bitácora
   */
  async getOrCreateExpedient(
    params: {
      patientIds: string[];
      patientNames: string[];
      therapyType: string;
    },
    user: UserContext,
  ) {
    const { patientIds, patientNames, therapyType } = params;

    const expedientsRef = collection(db, "expedients");
    const sortedIds = [...patientIds].sort();

    const q = query(
      expedientsRef,
      where("patientIds", "==", sortedIds),
      where("type", "==", therapyType),
    );

    const existingSnap = await getDocs(q);

    if (!existingSnap.empty) {
      const existingDoc = existingSnap.docs[0];
      return { id: existingDoc.id, code: existingDoc.data().code };
    }

    const code = await this.generateCode(patientNames);

    const newExpedient = {
      code,
      type: therapyType,
      patientIds: sortedIds,
      createdAt: serverTimestamp(),
      status: "Activo",
    };

    // 🟢 Creación con registro en auditoría
    const docRef = await addDocWithLog(
      "expedients",
      newExpedient,
      user,
      `Expediente generado (${code}) para: ${patientNames.join(", ")}`,
    );

    return { id: docRef.id, code };
  },
};
