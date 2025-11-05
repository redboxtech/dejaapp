// @ts-nocheck
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Logo } from "./Logo";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

interface AuthPageProps {
  onNavigate: (page: string) => void;
  onLogin: () => void;
}

export function LoginPage({ onNavigate, onLogin }: AuthPageProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);

      if (success) {
        toast.success("Login realizado com sucesso!");
        onLogin();
      } else {
        toast.error("Email ou senha incorretos. Verifique suas credenciais.");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6cced9]/10 to-[#16808c]/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-center text-2xl text-[#16808c]">
            Bem-vindo de volta
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="cursor-pointer">
                  Lembrar-me
                </Label>
              </div>
              <Button variant="link" className="text-[#16808c] p-0 h-auto">
                Esqueceu a senha?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#16808c] hover:bg-[#16808c]/90"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">Não tem uma conta? </span>
              <Button
                variant="link"
                className="text-[#16808c] p-0 h-auto"
                onClick={() => onNavigate("register")}
              >
                Criar conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function RegisterPage({ onNavigate, onLogin }: AuthPageProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isSelfElderly: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.isSelfElderly
      );

      if (success) {
        toast.success("Conta criada com sucesso!");
        onLogin();
      } else {
        toast.error("Este email já está cadastrado. Tente fazer login.");
      }
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6cced9]/10 to-[#16808c]/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-center text-2xl text-[#16808c]">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-center">
            Cadastre-se como Representante Legal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start gap-2 p-4 bg-[#6cced9]/10 rounded-lg">
              <Checkbox
                id="isSelfElderly"
                checked={formData.isSelfElderly}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isSelfElderly: checked as boolean,
                  })
                }
              />
              <div className="flex-1">
                <Label htmlFor="isSelfElderly" className="cursor-pointer">
                  Sou o próprio idoso
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Marque esta opção se você está se cadastrando para gerenciar
                  seus próprios cuidados
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#16808c] hover:bg-[#16808c]/90"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">Já tem uma conta? </span>
              <Button
                variant="link"
                className="text-[#16808c] p-0 h-auto"
                onClick={() => onNavigate("login")}
              >
                Entrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
