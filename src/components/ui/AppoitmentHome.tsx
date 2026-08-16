import { useEffect, useState } from "react";
import {
  Appointment,
  AppointmentService,
} from "../../services/inicioRecep.service"; // Ajusta la ruta relativa

export const Dashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Llamada a la función que filtra directamente las del día
        const data = await AppointmentService.getToday();
        setTodayAppointments(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar las citas del día");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) return <p>Cargando citas del día...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Citas de Hoy</h2>
      {todayAppointments.length === 0 ? (
        <p>No hay citas programadas para hoy.</p>
      ) : (
        <ul>
          {todayAppointments.map((appointment) => (
            <li key={appointment.id}>
              <strong>{appointment.time}</strong> - {appointment.patientName} (
              {appointment.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
