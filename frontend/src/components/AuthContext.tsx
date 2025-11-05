import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiFetch, decodeJwt, setToken } from "../lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  createdAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    isSelfElderly: boolean
  ) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar usuário da sessão ao iniciar
  useEffect(() => {
    const token = localStorage.getItem("deja_token");
    if (token) {
      // Preferir dados do backend
      apiFetch<User>(`/auth/me`)
        .then((user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // fallback para claims apenas se necessário
          const payload = decodeJwt<any>(token);
          if (payload) {
            const userFromToken: User = {
              id: payload.sub || payload.userId || "",
              name: payload.name || payload.unique_name || "",
              email: payload.email || "",
            };
            setCurrentUser(userFromToken);
            setIsAuthenticated(true);
          } else {
            setToken(null);
          }
        });
    }
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string,
    isSelfElderly: boolean
  ): Promise<boolean> => {
    try {
      const body = { name, email, password, isSelfElderly } as any;
      const res = await apiFetch<{ token: string }>(`/auth/register`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setToken(res.token);
      // Buscar usuário no backend
      const me = await apiFetch<User>(`/auth/me`);
      setCurrentUser(me);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Erro no registro:", error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiFetch<{ token: string }>(`/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      const me = await apiFetch<User>(`/auth/me`);
      setCurrentUser(me);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, login, register, logout, isAuthenticated }}
    >
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
