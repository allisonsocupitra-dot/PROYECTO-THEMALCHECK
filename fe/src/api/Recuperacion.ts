const API_URL = "http://localhost:8000/api/v1/recuperacion";

export async function solicitarRecuperacion(correo_usuario: string) {
  const res = await fetch(`${API_URL}/recuperar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo_usuario }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "El correo no está registrado.");
  }
  return res.json();
}

export async function restablecerContrasena(correo_usuario: string, nueva_contrasena: string) {
  const res = await fetch(`${API_URL}/restablecer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo_usuario, nueva_contrasena }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Error al actualizar la contraseña");
  }
  return res.json();
}