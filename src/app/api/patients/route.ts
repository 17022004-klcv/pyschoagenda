import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

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

// 🟢 POST /api/patients -> Guardar nuevo paciente en Firestore
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newPatientData = {
      ...body,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "patients"), newPatientData);

    return NextResponse.json(
      { id: docRef.id, ...newPatientData },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error al guardar en Firestore:", error);
    return NextResponse.json(
      { message: "Error al guardar el paciente", error: error.message },
      { status: 400 },
    );
  }
}
