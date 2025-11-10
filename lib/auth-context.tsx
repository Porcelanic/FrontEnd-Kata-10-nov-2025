"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "./types";
import { UserService } from "./api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    userData: Omit<User, "id"> & { contraseña: string }
  ) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await UserService.login(email, password);

    if (result.success && result.user) {
      const userData: User = {
        id: result.user.correo,
        correo: result.user.correo,
        nombre: result.user.nombre,
        cargo: result.user.cargo,
        centro_costos: result.user.centro_costos,
      };

      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      return true;
    }

    console.error("Login failed:", result.error);
    return false;
  };

  const register = async (
    userData: Omit<User, "id"> & { contraseña: string }
  ): Promise<boolean> => {
    const result = await UserService.register({
      correo: userData.correo,
      nombre: userData.nombre,
      cargo: userData.cargo,
      contraseña: userData.contraseña,
      centro_costos: userData.centro_costos,
    });

    if (result.success) {
      return true;
    }

    console.error("Registration failed:", result.error);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
