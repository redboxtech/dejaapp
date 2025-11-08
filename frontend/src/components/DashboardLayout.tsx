// @ts-nocheck
import React, { ReactNode, useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { Footer } from "./Footer";
import logo from "../img/deja-logo.png";
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
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserPlus,
  ChevronDown,
  ChevronUp,
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

type MenuEntry = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: MenuEntry[];
};

export function DashboardLayout({
  children,
  currentPage,
  onNavigate,
  onLogout,
  userName,
}: DashboardLayoutProps) {
  const { logout } = useAuth();
  const { replenishmentRequests } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Detectar se é desktop
  React.useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // Calcular número de solicitações pendentes
  const pendingRequestsCount = useMemo(() => {
    return replenishmentRequests.filter((req) => req.status === "pending")
      .length;
  }, [replenishmentRequests]);

  const menuItems = useMemo<MenuEntry[]>(
    () => [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "patients", label: "Pacientes", icon: Users },
      { id: "medications", label: "Medicamentos", icon: Pill },
      { id: "prescriptions", label: "Receitas", icon: FileText },
      { id: "stock", label: "Estoque", icon: Package },
      {
        id: "caregivers-group",
        label: "Cuidadores",
        icon: Users,
        children: [
          { id: "caregivers", label: "Cadastro", icon: UserPlus },
          { id: "caregiver-schedules", label: "Escala", icon: CalendarDays },
        ],
      },
      { id: "alerts", label: "Configurações", icon: Settings },
    ],
    [pendingRequestsCount]
  );

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.some((child) => child.id === currentPage)) {
        setOpenGroups((prev) =>
          prev[item.id] ? prev : { ...prev, [item.id]: true }
        );
      }
    });
  }, [currentPage, menuItems]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile/Tablet Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-all duration-300 ease-in-out flex flex-col shadow-xl
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-64"}
          lg:translate-x-0 lg:z-30 lg:shadow-none
        `}
      >
        <div className="border-b border-gray-200 hidden lg:block flex-shrink-0">
          {isCollapsed ? (
            <div className="px-3 py-6 flex flex-col items-center justify-center relative">
              <div className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 mb-2">
                <img
                  src={logo}
                  alt="Logo Deja"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsCollapsed(false)}
                title="Maximizar Menu"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="p-6 flex items-center justify-between h-16">
              <Logo showText={true} compact={false} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsCollapsed(true)}
                title="Minimizar Menu"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <nav
          className={`space-y-1 mt-16 lg:mt-0 ${
            isCollapsed
              ? "p-2 flex-shrink-0 overflow-hidden pb-20"
              : "p-4 flex-1 overflow-y-auto pb-20"
          }`}
        >
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isActive =
              currentPage === item.id ||
              item.children?.some((child) => child.id === currentPage);

            if (hasChildren) {
              if (isCollapsed) {
                return (
                  <DropdownMenu key={item.id}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-center px-2 h-10 gap-0"
                        title={item.label}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      className="w-56"
                    >
                      <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {item.children?.map((child) => (
                        <DropdownMenuItem
                          key={child.id}
                          onClick={() => {
                            onNavigate(child.id);
                            setSidebarOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <child.icon className="h-4 w-4 mr-2" />
                          {child.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              const isOpen =
                openGroups[item.id] ??
                item.children!.some((child) => child.id === currentPage);

              return (
                <div key={item.id} className="space-y-1">
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`
                      w-full justify-start gap-3
                      ${
                        isActive
                          ? "bg-[#6cced9]/20 text-[#16808c] hover:bg-[#6cced9]/30"
                          : "hover:bg-gray-100"
                      }
                    `}
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [item.id]: !isOpen,
                      }))
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">
                      {item.label}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                  {isOpen && (
                    <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-4">
                      {item.children?.map((child) => (
                        <Button
                          key={child.id}
                          variant={currentPage === child.id ? "secondary" : "ghost"}
                          className={`
                            w-full justify-start gap-2 text-sm
                            ${
                              currentPage === child.id
                                ? "bg-[#6cced9]/20 text-[#16808c] hover:bg-[#6cced9]/30"
                                : "hover:bg-gray-100 text-gray-700"
                            }
                          `}
                          onClick={() => {
                            onNavigate(child.id);
                            setSidebarOpen(false);
                          }}
                        >
                          <child.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1 text-left truncate">
                            {child.label}
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.id} className="relative group">
                <Button
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className={`
                    w-full
                    ${
                      isCollapsed
                        ? "justify-center px-2 h-10 gap-0 [&>*:not(:first-child)]:hidden"
                        : "justify-start gap-3 h-auto items-center"
                    }
                    ${
                      currentPage === item.id
                        ? "bg-[#6cced9]/20 text-[#16808c] hover:bg-[#6cced9]/30"
                        : "hover:bg-gray-100"
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
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-[#a61f43] text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-1 right-1 bg-[#a61f43] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center text-[10px] z-10">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </Button>
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md hidden group-hover:block opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-2 bg-[#a61f43] text-white text-xs px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Seção de Usuário Logado */}
        <div className="border-t border-gray-200 flex-shrink-0 absolute bottom-0 left-0 right-0 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full hover:bg-[#6cced9]/10 transition-colors ${
                  isCollapsed
                    ? "justify-center px-2 h-auto items-center"
                    : "justify-start gap-3 h-auto items-center"
                }`}
                title={isCollapsed ? formatDisplayName(userName) : undefined}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-[#16808c] text-white">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate">
                      {formatDisplayName(userName)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      Representante
                    </div>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isCollapsed ? "start" : "end"}
              className="w-56"
            >
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
      <main
        className="pt-16 lg:pt-0 flex-1 flex flex-col transition-all duration-300 relative z-10 w-full"
        style={{
          paddingBottom: "4rem", // Espaço para o footer
          ...(isDesktop ? (isCollapsed ? {
            width: "calc(100% - 5rem)",
            marginLeft: "5rem",
          } : {
            width: "calc(100% - 16rem)",
            marginLeft: "16rem",
          }) : {})
        }}
      >
        <div className="p-6 lg:p-8 w-full">{children}</div>
      </main>

      {/* Footer */}
      <Footer isCollapsed={isCollapsed} />
    </div>
  );
}
