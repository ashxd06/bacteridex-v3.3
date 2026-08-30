"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, supabaseHabilitado } from "@/lib/supabase/client";

export type ModoModalAuth = "login" | "registro" | "recuperar" | null;

export interface PerfilUsuario {
  username: string;
  role: "user" | "admin";
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  perfil: PerfilUsuario | null;
  esAdmin: boolean;
  cargando: boolean;
  habilitado: boolean;
  modalAbierto: ModoModalAuth;
  abrirModal: (modo: ModoModalAuth) => void;
  cerrarModal: () => void;
  iniciarSesion: (email: string, password: string) => Promise<{ error: string | null }>;
  crearCuenta: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ error: string | null; requiereConfirmacion?: boolean }>;
  cerrarSesion: () => Promise<void>;
  recuperarContrasena: (email: string) => Promise<{ error: string | null }>;
  actualizarContrasena: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

function traducirError(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists")) {
    return "Ese correo ya está registrado. Intenta iniciar sesión.";
  }
  if (m.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (m.includes("email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.";
  }
  if (m.includes("password should be at least") || m.includes("password is too short")) {
    return "La contraseña es demasiado débil (mínimo 6 caracteres).";
  }
  if (m.includes("invalid email") || m.includes("unable to validate email")) {
    return "El correo electrónico no es válido.";
  }
  if (m.includes("rate limit")) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "No se pudo conectar con el servidor. Revisa tu conexión a internet.";
  }
  return "Ocurrió un problema. Inténtalo de nuevo en unos segundos.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState<ModoModalAuth>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setCargando(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setCargando(false);
      if (data.session?.user) cargarPerfil(data.session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((evento, nuevaSesion) => {
      setSession(nuevaSesion);
      setUser(nuevaSesion?.user ?? null);
      if (evento === "PASSWORD_RECOVERY") {
        setModalAbierto("recuperar");
      }
      if (evento === "SIGNED_IN") {
        setModalAbierto(null);
        // Crea el perfil si todavía no existe (username viene de user_metadata).
        crearPerfilSiNoExiste(nuevaSesion?.user ?? null).then(() => cargarPerfil(nuevaSesion?.user ?? null));
      }
      if (evento === "SIGNED_OUT") {
        setPerfil(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function cargarPerfil(u: User | null) {
    const supabase = getSupabaseClient();
    if (!supabase || !u) {
      setPerfil(null);
      return;
    }
    const { data } = await supabase.from("profiles").select("username, role").eq("id", u.id).maybeSingle();
    if (data) {
      setPerfil({ username: data.username, role: (data.role as "user" | "admin") || "user" });
    }
  }

  async function crearPerfilSiNoExiste(u: User | null) {
    const supabase = getSupabaseClient();
    if (!supabase || !u) return;
    const { data: existente } = await supabase.from("profiles").select("id").eq("id", u.id).maybeSingle();
    if (!existente) {
      await supabase.from("profiles").insert({
        id: u.id,
        username: (u.user_metadata?.username as string) || u.email?.split("@")[0] || "Estudiante"
      });
    }
  }

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: "Las cuentas no están disponibles en este momento." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? traducirError(error.message) : null };
  }, []);

  const crearCuenta = useCallback(async (email: string, password: string, username: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: "Las cuentas no están disponibles en este momento." };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    if (error) return { error: traducirError(error.message) };
    const requiereConfirmacion = !data.session;
    return { error: null, requiereConfirmacion };
  }, []);

  const cerrarSesion = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error);
      return;
    }
    setSession(null);
    setUser(null);
    setPerfil(null);
    setModalAbierto(null);
  }, []);

  const recuperarContrasena = useCallback(async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: "Las cuentas no están disponibles en este momento." };
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/recuperar` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: error ? traducirError(error.message) : null };
  }, []);

  const actualizarContrasena = useCallback(async (password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: "Las cuentas no están disponibles en este momento." };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? traducirError(error.message) : null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        perfil,
        esAdmin: perfil?.role === "admin",
        cargando,
        habilitado: supabaseHabilitado,
        modalAbierto,
        abrirModal: setModalAbierto,
        cerrarModal: () => setModalAbierto(null),
        iniciarSesion,
        crearCuenta,
        cerrarSesion,
        recuperarContrasena,
        actualizarContrasena
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
