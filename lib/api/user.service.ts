const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export interface LoginResponse {
  success: boolean;
  user?: {
    correo: string;
    nombre: string;
    cargo: string;
    centro_costos: number;
  };
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  error?: string;
}

export class UserService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/usuario/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.tokens) {
        return {
          success: true,
          user: {
            correo: data.tokens.correo,
            nombre: data.tokens.nombre,
            cargo: data.tokens.cargo,
            centro_costos: data.tokens.centro_costos,
          },
        };
      }

      return {
        success: false,
        error:
          data.errors?.[0] || "Credenciales inválidas. Intente nuevamente.",
      };
    } catch (error) {
      console.error("Error during login:", error);
      return {
        success: false,
        error: "Error de conexión. Verifique su red e intente nuevamente.",
      };
    }
  }

  static async register(userData: {
    correo: string;
    nombre: string;
    cargo: string;
    contraseña: string;
    centro_costos: number;
  }): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/usuario/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: userData.correo,
          nombre: userData.nombre,
          cargo: userData.cargo,
          contrasena: userData.contraseña,
          centro_costos: userData.centro_costos,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        return { success: true };
      }

      return {
        success: false,
        error:
          data.errors?.[0] || "Error al registrar usuario. Intente nuevamente.",
      };
    } catch (error) {
      console.error("Error during registration:", error);
      return {
        success: false,
        error: "Error de conexión. Verifique su red e intente nuevamente.",
      };
    }
  }

  static async getAllUsers(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/usuario`);
      if (!response.ok) {
        console.error("Error fetching users");
        return [];
      }
      const data = await response.json();
      return data.usuarios || [];
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return [];
    }
  }

  static async getUserByEmail(email: string): Promise<any | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/usuario/${encodeURIComponent(email)}`
      );
      if (!response.ok) {
        console.error("Error fetching user");
        return null;
      }
      const data = await response.json();
      return data.usuario || null;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      return null;
    }
  }

  static async updateUser(
    email: string,
    updates: {
      nombre?: string;
      cargo?: string;
      contrasena?: string;
      centro_costos?: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/usuario/${encodeURIComponent(email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.errors?.[0] || "Error updating user",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in updateUser:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  static async deleteUser(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/usuario/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.errors?.[0] || "Error deleting user",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
