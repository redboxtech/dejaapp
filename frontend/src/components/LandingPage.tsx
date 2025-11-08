import { Button } from "./ui/button";
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
  Smartphone,
  Download,
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
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
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#6cced9]/10 to-[#16808c]/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-[#16808c] mb-4 md:mb-6">
                Cuidado organizado, família tranquila
              </h1>
              <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-xl">
                O Deja App é a plataforma completa para ajudar você a cuidar do
                que tem de mais valioso. Tenha controle total de medicamentos e
                rotinas, garantindo segurança e transparência em cada gesto de
                dedicação.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button
                  size="lg"
                  className="bg-[#16808c] hover:bg-[#16808c]/90 text-lg px-8"
                  onClick={() => onNavigate("register")}
                >
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-[#16808c] text-[#16808c] hover:bg-[#16808c]/10"
                  onClick={() => onNavigate("login")}
                >
                  Entrar no Sistema
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1758691462477-976f771224d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwY2FyZSUyMGNhcmVnaXZlcnxlbnwxfHx8fDE3NjAxMjQyOTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Cuidador e idoso"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#16808c] mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-center text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
            Uma plataforma completa para representantes legais e cuidadores
            gerenciarem o cuidado diário
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="border border-[#6cced9]/30 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#6cced9]/20 flex items-center justify-center mb-4">
                <Pill className="h-6 w-6 text-[#16808c]" />
              </div>
              <h3 className="text-xl font-semibold text-[#16808c] mb-2">
                Gestão de Medicamentos
              </h3>
              <p className="text-gray-600 text-sm">
                Controle completo de prescrições, horários, dosagens e estoques
                de medicamentos
              </p>
            </div>

            <div className="border border-[#6cced9]/30 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#a0bf80]/20 flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-[#a0bf80]" />
              </div>
              <h3 className="text-xl font-semibold text-[#16808c] mb-2">
                Alertas Inteligentes
              </h3>
              <p className="text-gray-600 text-sm">
                Receba notificações sobre horários de medicação, estoques baixos
                e receitas vencendo
              </p>
            </div>

            <div className="border border-[#6cced9]/30 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#f2c36b]/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#f2c36b]" />
              </div>
              <h3 className="text-xl font-semibold text-[#16808c] mb-2">
                Gestão de Cuidadores
              </h3>
              <p className="text-gray-600 text-sm">
                Organize e acompanhe a equipe de cuidadores responsável pelos
                pacientes
              </p>
            </div>

            <div className="border border-[#6cced9]/30 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#16808c]/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-[#16808c]" />
              </div>
              <h3 className="text-xl font-semibold text-[#16808c] mb-2">
                Segurança e Transparência
              </h3>
              <p className="text-gray-600 text-sm">
                Histórico completo de administrações e movimentações para total
                rastreabilidade
              </p>
            </div>

            <div className="border border-[#6cced9]/30 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#a61f43]/20 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-[#a61f43]" />
              </div>
              <h3 className="text-xl font-semibold text-[#16808c] mb-2">
                Cuidado Personalizado
              </h3>
              <p className="text-gray-600 text-sm">
                Adapte o sistema às necessidades específicas de cada paciente
              </p>
            </div>

            <div className="border border-[#6cced9]/30 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#6cced9]/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-[#6cced9]" />
              </div>
              <h3 className="text-xl font-semibold text-[#16808c] mb-2">
                Fácil de Usar
              </h3>
              <p className="text-gray-600 text-sm">
                Interface intuitiva, pensada para facilitar o dia a dia de quem
                ama de verdade (cuidadores e familiares)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#16808c] mb-8 md:mb-12">
            Benefícios para Todos
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
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

      {/* Mobile App Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#16808c] to-[#0d5d66]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-7xl mx-auto">
            {/* Left side - Mobile mockup */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                {/* Phone frame */}
                <div className="relative w-[240px] h-[480px] sm:w-[260px] sm:h-[540px] md:w-[280px] md:h-[600px] lg:w-[320px] lg:h-[680px] bg-white rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-[#16808c] rounded-[2.5rem] overflow-hidden relative">
                    {/* Status bar */}
                    <div className="absolute top-0 left-0 right-0 h-10 md:h-12 bg-[#0d5d66] flex items-center justify-between px-4 md:px-6 text-white text-xs z-10">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 border border-white rounded-sm">
                          <div className="w-full h-full bg-white rounded-sm"></div>
                        </div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* App content - Cuidador version */}
                    <div className="pt-10 md:pt-12 h-full bg-gradient-to-b from-[#16808c] to-[#6cced9]">
                      <div className="p-3 md:p-4 text-white">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Versão Cuidador</h4>
                            <p className="text-xs opacity-80">Deja App</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Pill className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Medicamentos
                              </span>
                            </div>
                            <p className="text-xs opacity-90">
                              3 medicamentos pendentes
                            </p>
                          </div>

                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Bell className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Alertas
                              </span>
                            </div>
                            <p className="text-xs opacity-90">
                              2 alertas ativos
                            </p>
                          </div>

                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Segurança
                              </span>
                            </div>
                            <p className="text-xs opacity-90">
                              Tudo sob controle
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Download info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="h-8 w-8" />
                <h2 className="text-3xl md:text-4xl font-bold">Baixe o App</h2>
              </div>
              <p className="text-base md:text-xl mb-6 md:mb-8 opacity-90">
                Tenha o Deja App sempre à mão. Disponível para iOS e Android.
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                    Escaneie o QR Code para baixar
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center">
                    {/* Google Play QR Code */}
                    <div className="text-center">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-white rounded-lg p-3 mb-3 flex items-center justify-center shadow-lg">
                        {/* QR Code placeholder - substituir por QR code real do Google Play quando disponível */}
                        <div className="w-full h-full bg-white rounded border-2 border-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <Download className="h-12 w-12 text-[#16808c] mx-auto mb-2" />
                            <p className="text-xs text-gray-500">QR Code</p>
                            <p className="text-xs text-gray-400">Google Play</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                        </svg>
                        <p className="text-sm font-medium">Google Play</p>
                      </div>
                    </div>

                    {/* App Store QR Code */}
                    <div className="text-center">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-white rounded-lg p-3 mb-3 flex items-center justify-center shadow-lg">
                        {/* QR Code placeholder - substituir por QR code real do App Store quando disponível */}
                        <div className="w-full h-full bg-white rounded border-2 border-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <Download className="h-12 w-12 text-[#16808c] mx-auto mb-2" />
                            <p className="text-xs text-gray-500">QR Code</p>
                            <p className="text-xs text-gray-400">App Store</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,9.08 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                        </svg>
                        <p className="text-sm font-medium">App Store</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    size="lg"
                    className="bg-white text-[#16808c] hover:bg-white/90 w-full sm:w-auto"
                    onClick={() => onNavigate("register")}
                  >
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#16808c] mb-3 md:mb-4">
            Pronto para começar?
          </h2>
          <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Junte-se a quem já confia no Deja App para cuidar de quem ama.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#16808c] hover:bg-[#16808c]/90 text-lg px-8"
              onClick={() => onNavigate("register")}
            >
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-[#16808c] text-[#16808c] hover:bg-[#16808c]/10"
              onClick={() => onNavigate("login")}
            >
              Já tenho uma conta
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
