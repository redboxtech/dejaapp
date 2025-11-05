import { ReactNode, useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { Footer } from "./Footer";
import { 
  LayoutDashboard, 
  Users, 
  Pill, 
  FileText,
  Package, 
  Bell, 
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Calendar,
  ChevronLeft,
  ChevronRight
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    { id: "prescriptions", label: "Receitas", icon: FileText },
    { id: "stock", label: "Estoque", icon: Package },
    { 
      id: "replenishment", 
      label: "Solicitações", 
      icon: ShoppingCart, 
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined 
    },
<<<<<<< HEAD
    { id: "caregiver-schedules", label: "Cuidadores", icon: Users },
    { id: "alerts", label: "Configurações", icon: Bell },
=======
    { id: "alerts", label: "Alertas", icon: Bell },
    { id: "settings", label: "Configurações", icon: Settings },
>>>>>>> master
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
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          lg:translate-x-0
        `}
      >
        <div className="border-b border-gray-200 hidden lg:block">
          {isCollapsed ? (
            <div className="p-3 flex justify-center items-center relative">
              <Logo showText={false} compact={true} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 absolute top-3 right-3"
                onClick={() => setIsCollapsed(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="p-6 flex items-center justify-between">
              <Logo showText={true} compact={false} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <nav className={`space-y-1 mt-16 lg:mt-0 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          {menuItems.map((item) => (
<<<<<<< HEAD
            <div key={item.id} className="relative group">
              <Button
                variant={currentPage === item.id ? "secondary" : "ghost"}
                className={`
                  w-full gap-3
                  ${isCollapsed ? 'justify-center px-2' : 'justify-start'}
                  ${currentPage === item.id 
                    ? 'bg-[#6cced9]/20 text-[#16808c] hover:bg-[#6cced9]/30' 
                    : 'hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-[#a61f43] text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1 right-1 bg-[#a61f43] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Button>
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-2 bg-[#a61f43] text-white text-xs px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
=======
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
>>>>>>> master
              )}
            </div>
          ))}
        </nav>

        <div className={`absolute bottom-0 left-0 right-0 border-t border-gray-200 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={`w-full hover:bg-[#6cced9]/10 transition-colors ${isCollapsed ? 'justify-center px-2' : 'justify-start gap-3'}`}
                title={isCollapsed ? formatDisplayName(userName) : undefined}
              >
                <Avatar className={`${isCollapsed ? 'h-10 w-10' : 'h-8 w-8'}`}>
                  <AvatarFallback className="bg-[#16808c] text-white">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate">{formatDisplayName(userName)}</div>
                    <div className="text-xs text-gray-500">Representante</div>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCollapsed ? "start" : "end"} className="w-56">
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
                  onNavigate("alerts");
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
      <main className={`pt-16 lg:pt-0 flex-1 flex flex-col pb-16 lg:pb-16 transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <Footer />

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
