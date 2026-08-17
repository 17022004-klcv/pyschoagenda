import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";

// 1. Auxiliar: Generar iniciales de un nombre
function getInitials(fullName: string): string {
  if (!fullName) return "";
  const words = fullName.trim().split(/\s+/);
  return words
    .slice(0, 2) // Toma las iniciales del nombre y primer apellido
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export const ExpedientService = {
  /**
   * Genera el código correlativo según las iniciales de los integrantes (ej. JCMP001)
   */
  async generateCode(patientNames: string[]): Promise<string> {
    // Une las iniciales de todos los integrantes
    // Ej: ["Juan Carlos", "María Pérez"] -> "JC" + "MP" = "JCMP"
    const combinedInitials = patientNames
      .map((name) => getInitials(name))
      .join("");

    const baseCode = combinedInitials || "EXP";

    // Buscar cuántos expedientes existen que inicien con estas letras
    const expedientsRef = collection(db, "expedients");
    const q = query(
      expedientsRef,
      where("code", ">=", baseCode),
      where("code", "<=", baseCode + "\uf8ff")
    );

    const snapshot = await getDocs(q);
    const count = snapshot.size + 1;
    const paddedNumber = String(count).padStart(3, "0");

    return `${baseCode}${paddedNumber}`;
  },

  /**
   * Obtiene o crea un expediente para una lista de pacientes
   */
  async getOrCreateExpedient(params: {
    patientIds: string[];
    patientNames: string[];
    therapyType: string;
  }) {
    const { patientIds, patientNames, therapyType } = params;

    const expedientsRef = collection(db, "expedients");

    // Opcional: Buscar si ya existe un expediente de este tipo con ESTOS MISMOS integrantes
    // (Asegúrate de ordenar los IDs para comparar arreglos idénticos)
    const sortedIds = [...patientIds].sort();

    const q = query(
      expedientsRef,
      where("patientIds", "==", sortedIds),
      where("type", "==", therapyType)
    );
    
    const existingSnap = await getDocs(q);

    if (!existingSnap.empty) {
      // Si ya existe, retornar el código existente
      const existingDoc = existingSnap.docs[0];
      return { id: existingDoc.id, code: existingDoc.data().code };
    }

    // Si no existe, se genera el código nuevo y se guarda el expediente
    const code = await this.generateCode(patientNames);

    const newExpedient = {
      code,
      type: therapyType,
      patientIds: sortedIds,
      createdAt: serverTimestamp(),
      status: "Activo",
    };

    const docRef = await addDoc(expedientsRef, newExpedient);

    return { id: docRef.id, code };
  }
};