import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  TherapyCategory,
  TherapyCategoryDocument,
  TherapyCategoryFormData,
  CategoryStatus,
} from "@/types/therapyCategory";
import { addDocWithLog, updateDocWithLog } from "@/lib/firestoreLogger";
import { UserContext } from "@/types/auditLog";

const CATEGORIES_COLLECTION = "therapy_categories";

const formatTimestamp = (timestamp: Timestamp): string => {
  if (!timestamp || !timestamp.toDate) return "N/A";
  return timestamp.toDate().toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getCategories = async (): Promise<TherapyCategory[]> => {
  const categoriesRef = collection(db, CATEGORIES_COLLECTION);
  const q = query(categoriesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as TherapyCategoryDocument;
    return {
      id: docSnap.id,
      name: data.name,
      status: data.status || "active",
      createdAt: formatTimestamp(data.createdAt),
    };
  });
};

export const createCategory = async (
  formData: TherapyCategoryFormData,
  user: UserContext,
): Promise<void> => {
  await addDocWithLog(
    CATEGORIES_COLLECTION,
    {
      name: formData.name.trim(),
      status: formData.status,
      createdAt: serverTimestamp(),
    },
    user,
    `Nueva categoría de terapia creada: ${formData.name.trim()}`,
  );
};

export const updateCategory = async (
  id: string,
  formData: TherapyCategoryFormData,
  user: UserContext,
): Promise<void> => {
  await updateDocWithLog(
    CATEGORIES_COLLECTION,
    id,
    {
      name: formData.name.trim(),
      status: formData.status,
    },
    user,
    `Categoría '${formData.name.trim()}' actualizada`,
  );
};

export const toggleCategoryStatus = async (
  id: string,
  newStatus: CategoryStatus,
  user: UserContext,
): Promise<void> => {
  await updateDocWithLog(
    CATEGORIES_COLLECTION,
    id,
    { status: newStatus },
    user,
    `Estado de la categoría (${id}) cambiado a ${newStatus}`,
  );
};
