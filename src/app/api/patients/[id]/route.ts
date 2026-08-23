import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updateDocWithLog, deleteDocWithLog } from "@/lib/firestoreLogger";

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

// 🟡 PUT /api/patients/[id] -> Actualizar paciente en Firestore con Auditoría
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Separar el objeto de usuario de la información del paciente
    const { user, ...updateData } = body;

    if (!user || !user.uid) {
      return NextResponse.json(
        {
          message:
            "Se requiere un usuario autenticado válido para actualizar y registrar la auditoría.",
        },
        { status: 400 },
      );
    }

    // Actualizar documento y registrar evento UPDATE en auditoría
    await updateDocWithLog(
      "patients",
      id,
      updateData,
      user,
      `Información del paciente (${id}) actualizada`,
    );

    return NextResponse.json(
      { message: "Paciente actualizado correctamente", id },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error al actualizar paciente con auditoría:", error);
    return NextResponse.json(
      { message: "Error al actualizar en Firestore", error: error.message },
      { status: 400 },
    );
  }
}

// 🟡 DELETE /api/patients/[id] -> Inactivar paciente en Firestore (Borrado Lógico con Auditoría)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    let user = null;

    try {
      const body = await request.json();
      user = body.user;
    } catch {
      // Manejo si el cuerpo viene vacío
    }

    if (!user || !user.uid) {
      return NextResponse.json(
        {
          message:
            "Se requiere un usuario autenticado válido para inactivar al paciente.",
        },
        { status: 400 },
      );
    }

    // 🟢 En lugar de deleteDocWithLog, realizamos un borrado lógico actualizando el estado a "Inactivo"
    await updateDocWithLog(
      "patients",
      id,
      { status: "Inactivo" },
      user,
      `Paciente (${id}) fue marcado como Inactivo (Desactivado)`,
    );

    return NextResponse.json(
      { message: "Paciente inactivado correctamente", id },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error al inactivar paciente con auditoría:", error);
    return NextResponse.json(
      { message: "Error al inactivar en Firestore", error: error.message },
      { status: 400 },
    );
  }
}
