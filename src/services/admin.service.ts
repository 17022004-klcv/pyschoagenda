import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAccount, UserDocument, ApproveUserPayload } from "@/types/user";
import { UserContext } from "@/types/auditLog";
import { updateDocWithLog } from "@/lib/firestoreLogger";

export const adminService = {
  // Obtener TODOS los usuarios para que el filtro del frontend funcione correctamente
  async getAccessRequests(): Promise<UserAccount[]> {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    const requests: UserAccount[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserDocument;

      const createdAtString = data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString();

      requests.push({
        uid: data.uid || docSnap.id,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        photoURL: data.photoURL || "",
        role: data.role || "unassigned",
        status: data.status || "pending",
        createdAt: createdAtString,
      });
    });

    return requests;
  },

  // Aprobar usuario con registro en bitácora
  async approveUser(
    { uid, role }: ApproveUserPayload,
    adminUser: UserContext,
  ): Promise<void> {
    await updateDocWithLog(
      "users",
      uid,
      {
        status: "active",
        role: role,
      },
      adminUser,
      `Usuario aprobado con el rol '${role}'`,
    );
  },

  // Rechazar usuario con registro en bitácora
  async rejectUser(uid: string, adminUser: UserContext): Promise<void> {
    await updateDocWithLog(
      "users",
      uid,
      {
        status: "rejected",
      },
      adminUser,
      "Solicitud de usuario rechazada",
    );
  },
};
