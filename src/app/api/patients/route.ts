import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { addDocWithLog } from "@/lib/firestoreLogger";

// 🟢 GET /api/patients -> Consultar todos los pacientes desde Firestore
export async function GET() {
  try {
    const patientsRef = collection(db, "patients");
    const q = query(patientsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const patients = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(patients, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener pacientes de Firestore:", error);
    return NextResponse.json(
      { message: "Error al consultar la base de datos", error: error.message },
      { status: 500 },
    );
  }
}

// 🟢 POST /api/patients -> Guardar nuevo paciente en Firestore con Auditoría
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Separamos el usuario del resto de los datos del paciente
    const { user, ...patientData } = body;

    // Validación estricta para la bitácora
    if (!user || !user.uid) {
      return NextResponse.json(
        {
          message:
            "Se requiere un usuario autenticado válido para registrar el evento en la bitácora.",
        },
        { status: 400 },
      );
    }

    const newPatientData = {
      ...patientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 🟢 Guardar paciente y registrar la auditoría INSERT
    const docRef = await addDocWithLog(
      "patients",
      newPatientData,
      user,
      `Paciente registrado: ${patientData.name || "Sin Nombre"}`,
    );

    return NextResponse.json(
      { id: docRef.id, ...newPatientData },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error al guardar en Firestore con Auditoría:", error);
    return NextResponse.json(
      { message: "Error al guardar el paciente", error: error.message },
      { status: 400 },
    );
  }
}
