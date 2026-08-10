import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 🔵 GET /api/patients/[id] -> Obtener paciente por ID desde Firestore
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const docRef = doc(db, "patients", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { message: "Paciente no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { id: docSnap.id, ...docSnap.data() },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error al consultar el paciente", error: error.message },
      { status: 500 },
    );
  }
}

// 🟡 PUT /api/patients/[id] -> Actualizar paciente en Firestore
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const docRef = doc(db, "patients", id);
    await updateDoc(docRef, {
      ...body,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { message: "Paciente actualizado correctamente", id },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error al actualizar en Firestore", error: error.message },
      { status: 400 },
    );
  }
}

// 🔴 DELETE /api/patients/[id] -> Eliminar paciente en Firestore
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const docRef = doc(db, "patients", id);

    await deleteDoc(docRef);

    return NextResponse.json(
      { message: "Paciente eliminado correctamente", id },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error al eliminar de Firestore", error: error.message },
      { status: 400 },
    );
  }
}
