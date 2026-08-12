import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

// 🟠 PUT /api/appointments/[id] -> Actualizar cita completa
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // 👈 CRUCIAL: Se usa await params
    const body = await request.json();

    const docRef = doc(db, "appointments", id);
    await updateDoc(docRef, {
      ...body,
      updatedAt: serverTimestamp(),
    });

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

    const docRef = doc(db, "appointments", id);
    await updateDoc(docRef, {
      status: "Cancelada",
      updatedAt: serverTimestamp(),
    });

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
