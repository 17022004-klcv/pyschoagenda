import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// 📥 GET /api/patients/download?id=XYZ -> Descargar ficha individual
export async function GET(request: NextRequest) {
  try {
    // Obtenemos el ID directamente desde los query params (?id=...)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "El ID del paciente es requerido" },
        { status: 400 }
      );
    }

    const docRef = doc(db, "patients", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { message: "Paciente no encontrado" },
        { status: 404 }
      );
    }

    const p = docSnap.data();
    const tutorInfo =
      p.isMinor && p.tutor
        ? `${p.tutor.name} (${p.tutor.relationship}) - DUI: ${p.tutor.dui} - Tel: ${p.tutor.phone}`
        : "N/A";

    // Formato CSV básico individual
    let csvContent = "Campo,Valor\n";
    csvContent += `ID,"${id}"\n`;
    csvContent += `Nombre,"${(p.name || "").replace(/"/g, '""')}"\n`;
    csvContent += `Genero,"${p.gender || ""}"\n`;
    csvContent += `Fecha de Nacimiento,"${p.birthDate || ""}"\n`;
    csvContent += `DUI,"${p.dui || "N/A"}"\n`;
    csvContent += `Telefono,"${p.phone || ""}"\n`;
    csvContent += `Correo,"${(p.email || "N/A").replace(/"/g, '""')}"\n`;
    csvContent += `Estado,"${p.status || ""}"\n`;
    csvContent += `Es Menor de Edad,"${p.isMinor ? "Sí" : "No"}"\n`;
    csvContent += `Informacion de Tutor,"${tutorInfo.replace(/"/g, '""')}"\n`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=ficha_${(p.name || "paciente").replace(/\s+/g, "_")}.csv`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error al descargar ficha", error: error.message },
      { status: 500 }
    );
  }
}