import Swal from "sweetalert2";

// Configuración base para los Toasts flotantes
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const showAlert = {
  // 🟢 Toast rápido de éxito (ej: "Paciente actualizado correctamente")
  successToast: (title: string) => {
    Toast.fire({
      icon: "success",
      title,
    });
  },

  // 🔴 Toast rápido de error
  errorToast: (title: string) => {
    Toast.fire({
      icon: "error",
      title,
    });
  },

  // ⚠️ Modal de Confirmación Estilizado (para Inactivar/Eliminar)
  confirm: async (
    title: string,
    text: string,
    confirmButtonText = "Sí, continuar",
  ) => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444", // Rojo para acciones destructivas
      cancelButtonColor: "#6B7280",
      confirmButtonText,
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl shadow-xl border border-gray-100",
        confirmButton: "px-4 py-2 text-sm font-semibold rounded-xl",
        cancelButton: "px-4 py-2 text-sm font-semibold rounded-xl",
      },
    });

    return result.isConfirmed;
  },
};
