import {
  collection,
  doc,
  getDocs,
  updateDoc,
  addDoc,
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
): Promise<void> => {
  const categoriesRef = collection(db, CATEGORIES_COLLECTION);
  await addDoc(categoriesRef, {
    name: formData.name.trim(),
    status: formData.status,
    createdAt: serverTimestamp(),
  });
};

export const updateCategory = async (
  id: string,
  formData: TherapyCategoryFormData,
): Promise<void> => {
  const categoryRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(categoryRef, {
    name: formData.name.trim(),
    status: formData.status,
  });
};

export const toggleCategoryStatus = async (
  id: string,
  newStatus: CategoryStatus,
): Promise<void> => {
  const categoryRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(categoryRef, { status: newStatus });
};
