import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  isSelfElderly: boolean;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, isSelfElderly: boolean) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar usuário da sessão ao iniciar
  useEffect(() => {
    const sessionUser = localStorage.getItem("deja_current_user");
    if (sessionUser) {
      const user = JSON.parse(sessionUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const register = async (name: string, email: string, password: string, isSelfElderly: boolean): Promise<boolean> => {
    try {
      // Verificar se o email já existe
      const users = JSON.parse(localStorage.getItem("deja_users") || "[]");
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        // Retornar false em vez de lançar erro
        return false;
      }

      // Criar novo usuário
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        isSelfElderly,
        createdAt: new Date().toISOString()
      };

      // Salvar usuário
      const userWithPassword = { ...newUser, password };
      users.push(userWithPassword);
      localStorage.setItem("deja_users", JSON.stringify(users));

      // Se é o próprio idoso, criar automaticamente seu perfil de paciente
      if (isSelfElderly) {
        const patients = JSON.parse(localStorage.getItem(`deja_patients_${newUser.id}`) || "[]");
        const selfPatient = {
          id: `patient_${Date.now()}`,
          name: name,
          age: 0, // Será atualizado quando informar a data de nascimento
          birthDate: "",
          careType: "Domiciliar",
          medications: 0,
          caregivers: 0,
          lastUpdate: "Há poucos segundos",
          criticalAlerts: 0,
          observations: "Autogerenciamento",
          ownerId: newUser.id,
          sharedWith: [] // Lista de IDs de representantes que têm acesso
        };
        patients.push(selfPatient);
        localStorage.setItem(`deja_patients_${newUser.id}`, JSON.stringify(patients));
      }

      // Fazer login automático
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("deja_current_user", JSON.stringify(newUser));

      return true;
    } catch (error) {
      console.error("Erro no registro:", error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem("deja_users") || "[]");
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (!user) {
        // Retornar false em vez de lançar erro
        return false;
      }

      // Remover senha antes de salvar na sessão
      const { password: _, ...userWithoutPassword } = user;
      
      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem("deja_current_user", JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("deja_current_user");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isAuthenticated }}>
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
