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

// 🟢 GET /api/appointments -> Obtener todas las citas
export async function GET() {
  try {
    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    const appointments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(appointments, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener citas de Firestore:", error);
    return NextResponse.json(
      { message: "Error al consultar las citas", error: error.message },
      { status: 500 },
    );
  }
}

// 🟢 POST /api/appointments -> Guardar nueva cita
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newAppointmentData = {
      ...body,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "appointments"),
      newAppointmentData,
    );

    return NextResponse.json(
      { id: docRef.id, ...newAppointmentData },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error al guardar cita en Firestore:", error);
    return NextResponse.json(
      { message: "Error al crear la cita", error: error.message },
      { status: 400 },
    );
  }
}
