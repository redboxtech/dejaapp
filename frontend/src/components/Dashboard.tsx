import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Users, 
  Pill, 
  AlertTriangle, 
  Clock, 
  Package,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useData } from "./DataContext";

interface DashboardProps {
  onNavigate: (page: string, id?: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { patients, medications, stockItems, replenishmentRequests } = useData();

  // Memoized computations para performance
  const upcomingMedications = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return medications
      .flatMap(med => 
        med.times.map(time => ({
          patient: med.patient,
          medication: `${med.name} ${med.dosage}${med.unit === "comprimido" ? "mg" : med.unit}`,
          time,
          status: "pending" as const
        }))
      )
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 4);
  }, [medications]);

  const criticalStocks = useMemo(() => {
    return stockItems
      .filter(s => s.status === "critical" || s.status === "warning")
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);
  }, [stockItems]);

  const expiringPrescriptions = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 86400000);
    
    return medications
      .filter(med => {
        const expiryDate = new Date(med.prescriptionExpiry);
        return expiryDate <= thirtyDaysFromNow && expiryDate > now;
      })
      .map(med => {
        const expiryDate = new Date(med.prescriptionExpiry);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / 86400000);
        return {
          medication: med.name,
          patient: med.patient,
          expiresIn: daysUntilExpiry,
          type: med.prescriptionType
        };
      })
      .sort((a, b) => a.expiresIn - b.expiresIn)
      .slice(0, 3);
  }, [medications]);

  const stats = useMemo(() => ({
    totalPatients: patients.length,
    totalMedications: medications.length,
    criticalAlerts: stockItems.filter(s => s.status === "critical").length,
    pendingRequests: replenishmentRequests.filter(r => r.status === "pending").length
  }), [patients, medications, stockItems, replenishmentRequests]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#16808c]">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do gerenciamento de cuidados</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pacientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-[#16808c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#16808c]">{stats.totalPatients}</div>
            <p className="text-xs text-gray-500 mt-1">
              Sob sua responsabilidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Medicamentos Ativos
            </CardTitle>
            <Pill className="h-4 w-4 text-[#6cced9]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#16808c]">{stats.totalMedications}</div>
            <p className="text-xs text-gray-500 mt-1">
              Entre todos os pacientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Estoques Críticos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-[#f2c36b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#f2c36b]">{stats.criticalAlerts}</div>
            <p className="text-xs text-gray-500 mt-1">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Solicitações
            </CardTitle>
            <Clock className="h-4 w-4 text-[#a0bf80]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#16808c]">{stats.pendingRequests}</div>
            <p className="text-xs text-gray-500 mt-1">
              Pendentes de aprovação
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Patients Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-[#16808c]">Meus Pacientes</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate("patients")}
              >
                Ver Todos
              </Button>
            </CardTitle>
            <CardDescription>
              Pacientes sob sua responsabilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {patients.slice(0, 3).map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onNavigate("patients", patient.id)}
              >
                <Avatar>
                  <AvatarFallback className="bg-[#6cced9] text-white">
                    {patient.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-gray-500">
                    {patient.age} anos • {patient.medications} medicamentos
                  </div>
                </div>
                {patient.criticalAlerts > 0 && (
                  <Badge variant="destructive" className="bg-[#a61f43]">
                    {patient.criticalAlerts}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-[#16808c]">Próximas Medicações</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate("medications")}
              >
                Ver Todas
              </Button>
            </CardTitle>
            <CardDescription>
              Horários de administração de hoje
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMedications.map((med, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6cced9]/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#16808c]" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{med.medication}</div>
                  <div className="text-sm text-gray-500">{med.patient}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[#16808c]">{med.time}</div>
                  <Badge variant="outline" className="text-xs">
                    Pendente
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Critical Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#f2c36b]" />
              <span className="text-[#16808c]">Estoques Críticos</span>
            </CardTitle>
            <CardDescription>
              Medicamentos com estoque baixo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalStocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Todos os estoques estão normais
              </div>
            ) : (
              <>
                {criticalStocks.map((stock) => (
                  <div key={stock.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{stock.medication}</div>
                        <div className="text-sm text-gray-500">{stock.patient}</div>
                      </div>
                      <Badge variant="outline" className={
                        stock.status === "critical" 
                          ? "text-[#a61f43] border-[#a61f43]" 
                          : "text-[#f2c36b] border-[#f2c36b]"
                      }>
                        {stock.daysLeft} dias
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Quantidade atual</span>
                        <span className="font-medium">{stock.current} {stock.unit}</span>
                      </div>
                      <Progress 
                        value={(stock.current / stock.boxQuantity) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full border-[#16808c] text-[#16808c] hover:bg-[#16808c]/10"
                  onClick={() => onNavigate("stock")}
                >
                  Ver Todos os Estoques
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Expiring Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#a61f43]" />
              <span className="text-[#16808c]">Receitas Vencendo</span>
            </CardTitle>
            <CardDescription>
              Receitas que precisam ser renovadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expiringPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma receita vencendo nos próximos 30 dias
              </div>
            ) : (
              <>
                {expiringPrescriptions.map((prescription, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-lg border-2 border-[#a61f43]/20 bg-[#a61f43]/5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">{prescription.medication}</div>
                        <div className="text-sm text-gray-500">{prescription.patient}</div>
                      </div>
                      <Badge className="bg-[#a61f43] text-white">
                        Tipo {prescription.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-[#a61f43]" />
                      <span className="text-[#a61f43] font-medium">
                        Vence em {prescription.expiresIn} dias
                      </span>
                    </div>
                  </div>
                ))}
                <Button 
                  className="w-full bg-[#16808c] hover:bg-[#16808c]/90"
                  onClick={() => onNavigate("alerts")}
                >
                  Configurar Alertas
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
