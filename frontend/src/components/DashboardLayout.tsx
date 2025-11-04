import { ReactNode, useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { Footer } from "./Footer";
import { 
  LayoutDashboard, 
  Users, 
  Pill, 
  Package, 
  Bell, 
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { formatDisplayName, getInitials } from "../lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userName: string;
}

export function DashboardLayout({ children, currentPage, onNavigate, onLogout, userName }: DashboardLayoutProps) {
  const { logout } = useAuth();
  const { replenishmentRequests } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // Calcular número de solicitações pendentes
  const pendingRequestsCount = useMemo(() => {
    return replenishmentRequests.filter(req => req.status === "pending").length;
  }, [replenishmentRequests]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: "Pacientes", icon: Users },
    { id: "medications", label: "Medicamentos", icon: Pill },
    { id: "stock", label: "Estoque", icon: Package },
    { 
      id: "replenishment", 
      label: "Solicitações", 
      icon: ShoppingCart, 
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined 
    },
    { id: "alerts", label: "Alertas", icon: Bell },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="p-6 border-b border-gray-200 hidden lg:block">
          <Logo />
        </div>

        <nav className="p-4 space-y-1 mt-16 lg:mt-0">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              className={`
                w-full justify-start gap-3
                ${currentPage === item.id 
                  ? 'bg-[#6cced9]/20 text-[#16808c] hover:bg-[#6cced9]/30' 
                  : 'hover:bg-gray-100'
                }
              `}
              onClick={() => {
                onNavigate(item.id);
                setSidebarOpen(false);
              }}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-[#a61f43] text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 hover:bg-[#6cced9]/10 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#16808c] text-white">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium truncate">{formatDisplayName(userName)}</div>
                  <div className="text-xs text-gray-500">Representante</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  onNavigate("profile");
                  setSidebarOpen(false);
                }}
                className="cursor-pointer"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  onNavigate("settings");
                  setSidebarOpen(false);
                }}
                className="cursor-pointer"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-[#a61f43] focus:text-[#a61f43]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 flex-1 flex flex-col">
        <div className="p-6 lg:p-8 flex-1">
          {children}
        </div>
        
        {/* Footer */}
        <Footer />
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
