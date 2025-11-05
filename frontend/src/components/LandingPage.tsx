import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Logo } from "./Logo";
import { Footer } from "./Footer";
import {
  Heart,
  Shield,
  Bell,
  Users,
  Pill,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
// @ts-ignore - imagem estática
import brandImage from "../img/deja-brand.png";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Obrigado! Você foi adicionado à lista de espera.");
    setFormData({ name: "", email: "", userType: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onNavigate("login")}>
              Entrar
            </Button>
            <Button
              className="bg-[#16808c] hover:bg-[#16808c]/90"
              onClick={() => onNavigate("register")}
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#6cced9]/10 to-[#16808c]/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-[#16808c] mb-6">
                Cuidado organizado, família tranquila
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                O Deja App é a plataforma completa para gestão do cuidado de
                pessoas dependentes. Controle medicamentos, organize cuidadores
                e garanta segurança com total transparência.
              </p>
              <Button
                size="lg"
                className="bg-[#16808c] hover:bg-[#16808c]/90 text-lg px-8"
                onClick={() => onNavigate("register")}
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758691462477-976f771224d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwY2FyZSUyMGNhcmVnaXZlcnxlbnwxfHx8fDE3NjAxMjQyOTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Cuidador e idoso"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#16808c] mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Uma plataforma completa para representantes legais e cuidadores
            gerenciarem o cuidado diário
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-[#6cced9]/30 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-6">
                <div className="w-12 h-12 rounded-lg bg-[#6cced9]/20 flex items-center justify-center mb-4">
                  <Pill className="h-6 w-6 text-[#16808c]" />
                </div>
                <CardTitle className="text-[#16808c]">
                  Gestão de Medicamentos
                </CardTitle>
                <CardDescription className="mb-0">
                  Controle completo de prescrições, horários, dosagens e
                  estoques de medicamentos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#6cced9]/30 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-6">
                <div className="w-12 h-12 rounded-lg bg-[#a0bf80]/20 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-[#a0bf80]" />
                </div>
                <CardTitle className="text-[#16808c]">
                  Alertas Inteligentes
                </CardTitle>
                <CardDescription className="mb-0">
                  Receba notificações sobre horários de medicação, estoques
                  baixos e receitas vencendo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#6cced9]/30 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-6">
                <div className="w-12 h-12 rounded-lg bg-[#f2c36b]/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[#f2c36b]" />
                </div>
                <CardTitle className="text-[#16808c]">
                  Gestão de Cuidadores
                </CardTitle>
                <CardDescription className="mb-0">
                  Organize e acompanhe a equipe de cuidadores responsável pelos
                  pacientes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#6cced9]/30 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-6">
                <div className="w-12 h-12 rounded-lg bg-[#16808c]/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-[#16808c]" />
                </div>
                <CardTitle className="text-[#16808c]">
                  Segurança e Transparência
                </CardTitle>
                <CardDescription className="mb-0">
                  Histórico completo de administrações e movimentações para
                  total rastreabilidade
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#6cced9]/30 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-6">
                <div className="w-12 h-12 rounded-lg bg-[#a61f43]/20 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-[#a61f43]" />
                </div>
                <CardTitle className="text-[#16808c]">
                  Cuidado Personalizado
                </CardTitle>
                <CardDescription className="mb-0">
                  Adapte o sistema às necessidades específicas de cada paciente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#6cced9]/30 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-6">
                <div className="w-12 h-12 rounded-lg bg-[#6cced9]/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-[#6cced9]" />
                </div>
                <CardTitle className="text-[#16808c]">Fácil de Usar</CardTitle>
                <CardDescription className="mb-0">
                  Interface intuitiva, pensada para facilitar o dia a dia de
                  representantes e cuidadores
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#16808c] mb-12">
            Benefícios para Todos
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-[#16808c] mb-4">
                Para Representantes
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#a0bf80] mt-0.5 flex-shrink-0" />
                  <span>Controle total sobre medicamentos e cuidadores</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#a0bf80] mt-0.5 flex-shrink-0" />
                  <span>Relatórios e histórico completo de administrações</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#a0bf80] mt-0.5 flex-shrink-0" />
                  <span>Alertas personalizados para nunca perder prazos</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-[#16808c] mb-4">
                Para Cuidadores
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#a0bf80] mt-0.5 flex-shrink-0" />
                  <span>Lista clara de medicamentos e horários</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#a0bf80] mt-0.5 flex-shrink-0" />
                  <span>Registro fácil de administrações pelo app</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#a0bf80] mt-0.5 flex-shrink-0" />
                  <span>Solicitação rápida de reposição de estoques</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-[#16808c] mb-4">
                Para Famílias
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#a0bf80] mt-0.5 flex-shrink-0" />
                  <span>Tranquilidade sabendo que tudo está organizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#a0bf80] mt-0.5 flex-shrink-0" />
                  <span>Transparência total sobre os cuidados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#a0bf80] mt-0.5 flex-shrink-0" />
                  <span>Menos erros e mais segurança</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-20 bg-gradient-to-br from-[#16808c] to-[#0d5d66] relative overflow-hidden">
        {/* Decorative dots pattern */}
        <div className="absolute left-0 top-0 w-80 h-80 opacity-10">
          <div className="grid grid-cols-8 gap-4 p-8">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white"></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-stretch max-w-7xl mx-auto">
            {/* Left side - Brand message */}
            <div className="flex-1 text-white flex items-center justify-center min-w-0 bg-gradient-to-br from-[#16808c] to-[#0d5d66] rounded-2xl p-8 md:p-12 self-stretch">
              <img
                src={brandImage}
                alt="Simplificando o cuidado, para quem ama de verdade"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Right side - Form */}
            <div className="flex-1 min-w-0 flex self-stretch">
              <Card className="shadow-2xl w-full flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-3xl text-center text-[#16808c]">
                    Entre para a Lista de Espera
                  </CardTitle>
                  <CardDescription className="text-center">
                    Seja um dos primeiros a experimentar o Deja App
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="userType">Tipo de Usuário</Label>
                      <Select
                        value={formData.userType}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, userType: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="representative">
                            Representante Legal
                          </SelectItem>
                          <SelectItem value="caregiver">Cuidador</SelectItem>
                          <SelectItem value="family">Familiar</SelectItem>
                          <SelectItem value="institution">
                            Instituição de Cuidados
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">Mensagem (Opcional)</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Conte-nos um pouco sobre suas necessidades..."
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#16808c] hover:bg-[#16808c]/90"
                      size="lg"
                    >
                      Entrar na Lista de Espera
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
}
