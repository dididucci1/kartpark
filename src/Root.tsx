import { useState } from "react";
import App from "./App";
import { Login } from "./pages/Login";

const AUTH_STORAGE_KEY = "kartodromo_auth";

export function Root() {
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === "ok";
    } catch {
      return false;
    }
  });

  function handleLogin() {
    setAutenticado(true);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, "ok");
    } catch {
      // ignore
    }
  }

  function handleLogout() {
    setAutenticado(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  if (!autenticado) {
    return <Login onLogin={handleLogin} />;
  }

  return <App onLogout={handleLogout} />;
}
