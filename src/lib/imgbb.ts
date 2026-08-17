// lib/imgbb.ts
export const uploadImageToImgBB = async (file: File): Promise<string> => {
  const API_KEY = "fd62d2967b1f4efd80cc29c778ca205d";

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Error al subir la imagen a ImgBB");
  }

  // Regresa la URL directa HTTPS de la imagen almacenada
  return data.data.url;
};
