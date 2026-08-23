import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { logAuditEvent } from "@/services/logger.service";

// 🟠 PUT /api/appointments/[id] -> Actualizar cita e ingresar log de auditoría
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Extraemos 'user' del body para que no se guarde dentro del documento 'appointments'
    const { user, ...updateData } = body;

    const docRef = doc(db, "appointments", id);

    // 1. Obtener la data previa para la auditoría
    const docSnap = await getDoc(docRef);
    const previousData = docSnap.exists() ? docSnap.data() : null;

    // 2. Actualizar el documento en Firestore
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    // 3. Registrar auditoría si vienen datos del usuario
    if (user) {
      await logAuditEvent({
        action: "UPDATE",
        collectionName: "appointments",
        documentId: id,
        performedBy: {
          uid: user.uid,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        details: `Cita actualizada a estado: ${updateData.status || "Modificada"}`,
        previousData: previousData ? { status: previousData.status } : null,
        newData: { status: updateData.status },
      });
    }

    return NextResponse.json(
      { message: "Cita actualizada correctamente" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error al actualizar la cita:", error);
    return NextResponse.json(
      { message: "Error al actualizar la cita", error: error.message },
      { status: 400 },
    );
  }
}

// 🔴 DELETE /api/appointments/[id] -> Cancelar / Inactivar Cita (Borrado lógico)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({})); // Captura opcional por si envían el usuario
    const { user } = body;

    const docRef = doc(db, "appointments", id);

    // 1. Obtener estado previo
    const docSnap = await getDoc(docRef);
    const previousData = docSnap.exists() ? docSnap.data() : null;

    // 2. Actualizar estado a Cancelada
    await updateDoc(docRef, {
      status: "Cancelada",
      updatedAt: serverTimestamp(),
    });

    // 3. Registrar auditoría de cancelación
    if (user) {
      await logAuditEvent({
        action: "DELETE",
        collectionName: "appointments",
        documentId: id,
        performedBy: {
          uid: user.uid,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        details: "Cita cancelada mediante eliminación lógica",
        previousData: previousData ? { status: previousData.status } : null,
        newData: { status: "Cancelada" },
      });
    }

    return NextResponse.json(
      { message: "Cita cancelada correctamente" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error al cancelar la cita:", error);
    return NextResponse.json(
      { message: "Error al cancelar la cita", error: error.message },
      { status: 400 },
    );
  }
}
