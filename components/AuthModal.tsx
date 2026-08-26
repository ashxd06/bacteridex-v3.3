"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function AuthModal() {
  const {
    modalAbierto,
    cerrarModal,
    abrirModal,
    iniciarSesion,
    crearCuenta,
    recuperarContrasena,
    actualizarContrasena,
    user
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  if (!modalAbierto) return null;

  function limpiar() {
    setEmail("");
    setPassword("");
    setPassword2("");
    setUsername("");
    setError(null);
    setMensaje(null);
  }

  function cambiarModo(modo: "login" | "registro") {
    limpiar();
    abrirModal(modo);
  }

  async function onSubmitLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const { error } = await iniciarSesion(email, password);
    setCargando(false);
    if (error) setError(error);
  }

  async function onSubmitRegistro(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError("Elige un nombre de usuario.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setCargando(true);
    const { error, requiereConfirmacion } = await crearCuenta(email, password, username.trim());
    setCargando(false);
    if (error) {
      setError(error);
      return;
    }
    if (requiereConfirmacion) {
      setMensaje("Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.");
    }
  }

  async function onSubmitOlvide(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const { error } = await recuperarContrasena(email);
    setCargando(false);
    if (error) {
      setError(error);
      return;
    }
    setMensaje("Te enviamos un correo con instrucciones para restablecer tu contraseña.");
  }

  async function onSubmitNuevaContrasena(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setCargando(true);
    const { error } = await actualizarContrasena(password);
    setCargando(false);
    if (error) {
      setError(error);
      return;
    }
    setMensaje("Tu contraseña se actualizó correctamente.");
  }

  const esLogin = modalAbierto === "login";
  const esRecuperar = modalAbierto === "recuperar";
  const recuperandoConSesion = esRecuperar && !!user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/80 backdrop-blur-sm p-4">
      <div className="lab-card relative w-full max-w-sm p-6">
        <button
          onClick={cerrarModal}
          aria-label="Cerrar"
          className="focus-ring absolute right-4 top-4 text-mist-400 hover:text-mist-100"
        >
          ✕
        </button>

        <p className="section-eyebrow">
          {esLogin ? "🔐 Iniciar sesión" : esRecuperar ? "🔑 Recuperar contraseña" : "✨ Crear cuenta"}
        </p>
        <h2 className="mt-1 font-display text-xl font-bold">
          {esLogin
            ? "Bienvenido de nuevo"
            : esRecuperar
            ? recuperandoConSesion
              ? "Elige tu nueva contraseña"
              : "Restablecer contraseña"
            : "Únete a BacteriDex"}
        </h2>
        <p className="mt-1 text-xs text-mist-400">
          {esLogin
            ? "Accede a tus favoritos, notas e historial personal."
            : esRecuperar
            ? recuperandoConSesion
              ? "Escribe una nueva contraseña para tu cuenta."
              : "Te enviaremos un enlace a tu correo para restablecerla."
            : "Guarda favoritos, notas e historial de estudio en tu cuenta."}
        </p>

        {mensaje ? (
          <div className="mt-5 rounded-lg border border-bio/30 bg-bio/10 p-3 text-sm text-bio">
            {mensaje}
          </div>
        ) : esRecuperar ? (
          <form
            onSubmit={recuperandoConSesion ? onSubmitNuevaContrasena : onSubmitOlvide}
            className="mt-5 flex flex-col gap-3"
          >
            {recuperandoConSesion ? (
              <>
                <Campo label="Nueva contraseña">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                    placeholder="Mínimo 6 caracteres"
                  />
                </Campo>
                <Campo label="Confirmar nueva contraseña">
                  <input
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                    className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                    placeholder="Repite tu contraseña"
                  />
                </Campo>
              </>
            ) : (
              <Campo label="Correo electrónico">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                  placeholder="tucorreo@ejemplo.com"
                />
              </Campo>
            )}

            {error && (
              <p className="rounded-lg border border-alert/30 bg-alert/10 p-2 text-xs text-alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="focus-ring mt-1 rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow disabled:opacity-60"
            >
              {cargando ? "Un momento…" : recuperandoConSesion ? "Guardar nueva contraseña" : "Enviar enlace"}
            </button>
          </form>
        ) : (
          <form onSubmit={esLogin ? onSubmitLogin : onSubmitRegistro} className="mt-5 flex flex-col gap-3">
            {!esLogin && (
              <Campo label="Nombre de usuario">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                  placeholder="Ej. maria_lab"
                />
              </Campo>
            )}
            <Campo label="Correo electrónico">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                placeholder="tucorreo@ejemplo.com"
              />
            </Campo>
            <Campo label="Contraseña">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                placeholder="Mínimo 6 caracteres"
              />
            </Campo>
            {!esLogin && (
              <Campo label="Confirmar contraseña">
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                  placeholder="Repite tu contraseña"
                />
              </Campo>
            )}

            {error && (
              <p className="rounded-lg border border-alert/30 bg-alert/10 p-2 text-xs text-alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="focus-ring mt-1 rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow disabled:opacity-60"
            >
              {cargando ? "Un momento…" : esLogin ? "Iniciar sesión" : "Crear cuenta"}
            </button>

            {esLogin && (
              <button
                type="button"
                onClick={() => abrirModal("recuperar")}
                className="focus-ring text-xs text-mist-400 hover:text-bio"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </form>
        )}

        {!esRecuperar && (
          <p className="mt-5 text-center text-xs text-mist-400">
            {esLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              onClick={() => cambiarModo(esLogin ? "registro" : "login")}
              className="focus-ring font-medium text-bio hover:text-bio-glow"
            >
              {esLogin ? "Crear cuenta" : "Iniciar sesión"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-mist-300">
      {label}
      {children}
    </label>
  );
}
