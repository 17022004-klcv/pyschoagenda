import {
  collection,
  doc,
  getDocs,
  getDoc,
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
import { logAuditEvent } from "@/services/logger.service";
import { UserContext } from "@/types/auditLog";

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
 * Crea la cuenta en Firebase Auth, guarda en Firestore y registra auditoría.
 */
export const createUserWithAuth = async (
  userData: UserFormData,
  currentUser?: UserContext,
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

    const newUserData = {
      uid: newUid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      photoURL: userData.photoURL || "https://i.ibb.co/ptJ1Mcc/OIP.jpg",
      role: userData.role,
      status: userData.status || "active",
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, newUserData);

    // 📝 Auditoría
    if (currentUser) {
      await logAuditEvent({
        action: "INSERT",
        collectionName: USERS_COLLECTION,
        documentId: newUid,
        performedBy: currentUser,
        details: `Nuevo usuario creado: ${userData.name} (${userData.role})`,
        newData: {
          name: userData.name,
          email: userData.email,
          role: userData.role,
        },
      });
    }

    await signOut(secondaryAuth);
  } catch (error) {
    console.error("Error al registrar usuario en Auth/Firestore:", error);
    throw error;
  }
};

export const createUser = createUserWithAuth;

/**
 * Actualizar datos de usuario en Firestore y registrar auditoría
 */
export const updateUser = async (
  uid: string,
  userData: Partial<UserFormData>,
  currentUser?: UserContext,
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);

    // Obtener estado previo para auditoría
    const docSnap = await getDoc(userRef);
    const previousData = docSnap.exists() ? docSnap.data() : null;

    const updatedData = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      status: userData.status,
      photoURL: userData.photoURL,
    };

    await updateDoc(userRef, updatedData);

    // 📝 Auditoría
    if (currentUser) {
      await logAuditEvent({
        action: "UPDATE",
        collectionName: USERS_COLLECTION,
        documentId: uid,
        performedBy: currentUser,
        details: `Usuario ${userData.name || uid} actualizado`,
        previousData: previousData
          ? {
              name: previousData.name,
              role: previousData.role,
              status: previousData.status,
            }
          : null,
        newData: updatedData,
      });
    }
  } catch (error) {
    console.error(`Error al actualizar usuario ${uid}:`, error);
    throw error;
  }
};

/**
 * Inactivar / Activar usuario (Soft Delete)
 */
export const toggleUserStatus = async (
  uid: string,
  newStatus: "active" | "inactive",
  currentUser?: UserContext,
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);

    const docSnap = await getDoc(userRef);
    const previousData = docSnap.exists() ? docSnap.data() : null;

    await updateDoc(userRef, {
      status: newStatus,
    });

    // 📝 Auditoría
    if (currentUser) {
      await logAuditEvent({
        action: newStatus === "inactive" ? "DELETE" : "UPDATE",
        collectionName: USERS_COLLECTION,
        documentId: uid,
        performedBy: currentUser,
        details: `Estado de usuario cambiado a ${newStatus}`,
        previousData: previousData ? { status: previousData.status } : null,
        newData: { status: newStatus },
      });
    }
  } catch (error) {
    console.error(`Error al cambiar estado del usuario ${uid}:`, error);
    throw error;
  }
};
