import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage, RegisterPage } from "./components/AuthPages";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./components/Dashboard";
import { PatientsPage } from "./components/PatientsPage";
import { MedicationsPage } from "./components/MedicationsPage";
import { StockPage } from "./components/StockPage";
import { AlertsPage } from "./components/AlertsPage";
import { ReplenishmentPage } from "./components/ReplenishmentPage";
import { ProfilePage } from "./components/ProfilePage";
import { Toaster } from "./components/ui/sonner";
import { DataProvider } from "./components/DataContext";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { toast } from "sonner@2.0.3";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("landing");
  const { isAuthenticated, currentUser } = useAuth();

  const handleLogin = () => {
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    toast.success("Sessão encerrada com sucesso");
    setCurrentPage("landing");
  };

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page);
  };

  // Landing and Auth Pages
  if (!isAuthenticated) {
    switch (currentPage) {
      case "login":
        return (
          <>
            <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
            <Toaster />
          </>
        );
      case "register":
        return (
          <>
            <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />
            <Toaster />
          </>
        );
      default:
        return (
          <>
            <LandingPage onNavigate={handleNavigate} />
            <Toaster />
          </>
        );
    }
  }

  // Dashboard Pages
  const renderDashboardContent = () => {
    switch (currentPage) {
      case "profile":
        return <ProfilePage />;
      case "patients":
        return <PatientsPage onNavigate={handleNavigate} />;
      case "medications":
        return <MedicationsPage />;
      case "stock":
        return <StockPage />;
      case "alerts":
        return <AlertsPage />;
      case "replenishment":
        return <ReplenishmentPage />;
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[#16808c]">Configurações</h1>
              <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
            </div>
            <div className="text-center py-12 text-gray-500">
              Em desenvolvimento...
            </div>
          </div>
        );
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <DataProvider>
        <DashboardLayout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          userName={currentUser?.name || ""}
        >
          {renderDashboardContent()}
        </DashboardLayout>
      </DataProvider>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
