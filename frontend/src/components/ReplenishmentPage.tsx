import { useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  ShoppingCart, 
  Check, 
  X, 
  Clock,
  Package,
  CheckCircle2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner@2.0.3";
import { useData } from "./DataContext";

export function ReplenishmentPage() {
  const { replenishmentRequests, approveReplenishment, rejectReplenishment } = useData();

  // Memoized filtered requests
  const pendingRequests = useMemo(() => {
    return replenishmentRequests.filter(r => r.status === "pending");
  }, [replenishmentRequests]);

  const completedRequests = useMemo(() => {
    return replenishmentRequests.filter(r => r.status === "completed");
  }, [replenishmentRequests]);

  // Memoized stats
  const stats = useMemo(() => {
    const pending = pendingRequests.length;
    const completedThisWeek = completedRequests.filter(r => {
      if (!r.completedDate) return false;
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      return new Date(r.completedDate) >= weekAgo;
    }).length;
    const urgent = pendingRequests.filter(r => r.urgency === "high").length;

    return { pending, completedThisWeek, urgent };
  }, [pendingRequests, completedRequests]);

  const handleApprove = (requestId: string) => {
    const request = replenishmentRequests.find(r => r.id === requestId);
    if (request) {
      approveReplenishment(requestId, request.requestedQuantity);
      toast.success("Reposição confirmada! Estoque atualizado.");
    }
  };

  const handleReject = (requestId: string) => {
    rejectReplenishment(requestId);
    toast.error("Solicitação rejeitada.");
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-[#a61f43] text-white";
      case "medium": return "bg-[#f2c36b] text-white";
      default: return "bg-[#6cced9] text-white";
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high": return "Urgente";
      case "medium": return "Moderado";
      default: return "Baixo";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#16808c]">Solicitações de Reposição</h1>
        <p className="text-gray-600 mt-1">
          Gerencie as solicitações de reposição de estoque dos cuidadores
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f2c36b]/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#f2c36b]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#16808c]">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#a0bf80]/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-[#a0bf80]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#a0bf80]">{stats.completedThisWeek}</div>
                <div className="text-sm text-gray-600">Aprovadas esta semana</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#a61f43]/20 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-[#a61f43]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#a61f43]">{stats.urgent}</div>
                <div className="text-sm text-gray-600">Urgente</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Concluídas ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma solicitação pendente</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#6cced9]/20 flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-[#16808c]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#16808c]">{request.medication}</h3>
                          <p className="text-gray-600">{request.patient}</p>
                        </div>
                      </div>
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {getUrgencyText(request.urgency)}
                      </Badge>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Solicitado por</div>
                        <div className="font-medium text-sm">{request.requestedBy}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Data da Solicitação</div>
                        <div className="font-medium text-sm">
                          {new Date(request.requestDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Estoque Atual</div>
                        <div className="font-medium text-sm text-[#a61f43]">
                          {request.currentStock} unidades
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Previsão de Término</div>
                        <div className="font-medium text-sm">
                          {new Date(request.estimatedEndDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="p-4 bg-[#6cced9]/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Quantidade Solicitada:</span>
                        <span className="text-lg font-bold text-[#16808c]">
                          {request.requestedQuantity} unidades
                        </span>
                      </div>
                      {request.notes && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Observação:</span> {request.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-[#a0bf80] hover:bg-[#a0bf80]/90"
                        onClick={() => handleApprove(request.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirmar Reposição
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[#a61f43] text-[#a61f43] hover:bg-[#a61f43]/10"
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed Requests */}
        <TabsContent value="completed" className="space-y-4">
          {completedRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#a0bf80]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-[#a0bf80]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#16808c]">{request.medication}</h3>
                        <p className="text-gray-600">{request.patient}</p>
                      </div>
                      <Badge className="bg-[#a0bf80] text-white">
                        Concluída
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Solicitado por</div>
                        <div className="font-medium">{request.requestedBy}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Data da Solicitação</div>
                        <div className="font-medium">
                          {new Date(request.requestDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Data de Conclusão</div>
                        <div className="font-medium">
                          {request.completedDate && new Date(request.completedDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Quantidade Adicionada</div>
                        <div className="font-medium text-[#a0bf80]">
                          +{request.addedQuantity} unidades
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
