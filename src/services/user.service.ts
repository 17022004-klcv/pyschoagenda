import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db } from "@/lib/firebase";
import { UserDocument, UserAccount, UserFormData } from "@/types/user";

const USERS_COLLECTION = "users";

export const formatFirestoreTimestamp = (timestamp: Timestamp): string => {
  if (!timestamp || !timestamp.toDate) return "N/A";
  return timestamp.toDate().toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getUsers = async (): Promise<UserAccount[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data() as UserDocument;
      return {
        ...data,
        uid: docSnap.id,
        status: data.status || "active",
        createdAt: formatFirestoreTimestamp(data.createdAt),
      };
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

/**
 * Crea la cuenta en Firebase Auth y la ficha en Firestore.
 * Utiliza una app secundaria para mantener intacta la sesión activa del administrador.
 */
export const createUserWithAuth = async (
  userData: UserFormData,
): Promise<void> => {
  if (!userData.password || userData.password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const primaryApp = getApp();
  const firebaseConfig = primaryApp.options;

  const secondaryAppName = "secondaryAdminApp";
  let secondaryApp = getApps().find((app) => app.name === secondaryAppName);
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  }

  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      userData.email,
      userData.password,
    );

    const newUid = userCredential.user.uid;

    const userRef = doc(db, USERS_COLLECTION, newUid);
    await setDoc(userRef, {
      uid: newUid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      photoURL: userData.photoURL || "https://i.ibb.co/ptJ1Mcc/OIP.jpg",
      role: userData.role,
      status: userData.status || "active",
      createdAt: serverTimestamp(),
    });

    await signOut(secondaryAuth);
  } catch (error) {
    console.error("Error al registrar usuario en Auth/Firestore:", error);
    throw error;
  }
};

// 💡 Export Alias para mantener compatibilidad si importas 'createUser' en la vista
export const createUser = createUserWithAuth;

/**
 * Actualizar datos de Firestore
 */
export const updateUser = async (
  uid: string,
  userData: Partial<UserFormData>,
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      status: userData.status,
      photoURL: userData.photoURL,
    });
  } catch (error) {
    console.error(`Error al actualizar usuario ${uid}:`, error);
    throw error;
  }
};

/**
 * Inactivar usuario (Soft Delete)
 */
export const toggleUserStatus = async (
  uid: string,
  newStatus: "active" | "inactive",
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      status: newStatus,
    });
  } catch (error) {
    console.error(`Error al cambiar estado del usuario ${uid}:`, error);
    throw error;
  }
};
