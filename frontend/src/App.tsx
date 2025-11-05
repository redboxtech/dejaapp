import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage, RegisterPage } from "./components/AuthPages";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./components/Dashboard";
import { PatientsPage } from "./components/PatientsPage";
import { MedicationsPage } from "./components/MedicationsPage";
import { PrescriptionsPage } from "./components/PrescriptionsPage";
import { StockPage } from "./components/StockPage";
import { AlertsPage } from "./components/AlertsPage";
import { ReplenishmentPage } from "./components/ReplenishmentPage";
import { ProfilePage } from "./components/ProfilePage";
import { CaregiverSchedulesPage } from "./components/CaregiverSchedulesPage";
import { Toaster } from "./components/ui/sonner";
import { DataProvider } from "./components/DataContext";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { toast } from "sonner";

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
      case "prescriptions":
        return <PrescriptionsPage />;
      case "stock":
        return <StockPage />;
      case "alerts":
        return <AlertsPage />;
      case "replenishment":
        return <ReplenishmentPage />;
      case "caregiver-schedules":
        return <CaregiverSchedulesPage />;
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
