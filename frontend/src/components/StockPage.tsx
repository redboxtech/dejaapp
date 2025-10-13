import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Plus, 
  Search, 
  Package,
  TrendingDown,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  History
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner@2.0.3";
import { useData } from "./DataContext";

export function StockPage() {
  const { stockItems, medications, addStockEntry } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [newStock, setNewStock] = useState({
    medicationId: "",
    quantity: "",
    source: "",
    prescription: ""
  });

  // Memoized filtered stock
  const filteredStock = useMemo(() => {
    return stockItems.filter(item =>
      item.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stockItems, searchTerm]);

  // Memoized stats
  const stats = useMemo(() => {
    const total = stockItems.length;
    const normal = stockItems.filter(s => s.status === "ok").length;
    const warning = stockItems.filter(s => s.status === "warning").length;
    const critical = stockItems.filter(s => s.status === "critical").length;

    return { total, normal, warning, critical };
  }, [stockItems]);

  const handleAddStock = () => {
    if (!newStock.medicationId || !newStock.quantity) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const quantity = parseFloat(newStock.quantity);
    const source = newStock.source === "purchase" ? "Compra" :
                   newStock.source === "donation" ? "Doação" : "Transferência";

    addStockEntry(newStock.medicationId, quantity, source);
    toast.success("Entrada de estoque registrada com sucesso!");
    setIsAddStockOpen(false);
    setNewStock({ medicationId: "", quantity: "", source: "", prescription: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-[#a61f43]";
      case "warning": return "bg-[#f2c36b]";
      default: return "bg-[#a0bf80]";
    }
  };

  const getProgressValue = (current: number, boxQuantity: number) => {
    return Math.min((current / boxQuantity) * 100, 100);
  };

  const getUnitLabel = (unit: string) => {
    const labels: Record<string, string> = {
      comprimido: "comp",
      ml: "ml",
      gotas: "gts",
      mg: "mg",
      g: "g",
      aplicacao: "apl",
      inalacao: "inal"
    };
    return labels[unit] || unit;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16808c]">Controle de Estoque</h1>
          <p className="text-gray-600 mt-1">Gerencie as entradas e saídas de medicamentos</p>
        </div>
        
        <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#16808c] hover:bg-[#16808c]/90">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Entrada
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#16808c]">Registrar Entrada de Estoque</DialogTitle>
              <DialogDescription>
                Adicione uma nova entrada de medicamento ao estoque
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="medication">Medicamento *</Label>
                <Select
                  value={newStock.medicationId}
                  onValueChange={(value) => setNewStock({ ...newStock, medicationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o medicamento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {medications.map(med => (
                      <SelectItem key={med.id} value={med.id}>
                        {med.name} {med.dosage}{getUnitLabel(med.unit)} - {med.patient}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                  placeholder="Ex: 30"
                />
              </div>

              <div>
                <Label htmlFor="source">Origem *</Label>
                <Select
                  value={newStock.source}
                  onValueChange={(value) => setNewStock({ ...newStock, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Compra</SelectItem>
                    <SelectItem value="donation">Doação</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddStockOpen(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-[#16808c] hover:bg-[#16808c]/90"
                onClick={handleAddStock}
              >
                Registrar Entrada
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar medicamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6cced9]/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-[#16808c]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#16808c]">{stats.total}</div>
                <div className="text-xs text-gray-600">Total de Itens</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#a0bf80]/20 flex items-center justify-center">
                <ArrowUpCircle className="h-5 w-5 text-[#a0bf80]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#a0bf80]">{stats.normal}</div>
                <div className="text-xs text-gray-600">Estoque Normal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f2c36b]/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-[#f2c36b]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#f2c36b]">{stats.warning}</div>
                <div className="text-xs text-gray-600">Necessita Atenção</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#a61f43]/20 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-[#a61f43]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#a61f43]">{stats.critical}</div>
                <div className="text-xs text-gray-600">Estoque Crítico</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock List */}
      <div className="grid gap-4">
        {filteredStock.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#16808c]">{item.medication}</h3>
                    <p className="text-gray-600">{item.patient}</p>
                  </div>
                  <Badge className={`${getStatusColor(item.status)} text-white`}>
                    {item.status === "critical" ? "Crítico" : item.status === "warning" ? "Atenção" : "Normal"}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estoque atual: {item.current} {getUnitLabel(item.unit)}</span>
                    <span className="font-medium">{Math.round(getProgressValue(item.current, item.boxQuantity))}%</span>
                  </div>
                  <Progress 
                    value={getProgressValue(item.current, item.boxQuantity)}
                    className="h-3"
                  />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Consumo Diário</div>
                    <div className="font-medium">{item.dailyConsumption} {getUnitLabel(item.unit)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Dias Restantes</div>
                    <div className="font-medium text-[#16808c]">{item.daysLeft} dias</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Previsão de Término</div>
                    <div className="font-medium">
                      {new Date(item.estimatedEndDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Qtd. por Embalagem</div>
                    <div className="font-medium">{item.boxQuantity} {getUnitLabel(item.unit)}</div>
                  </div>
                </div>

                {/* Recent Movements */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <History className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm text-gray-700">Movimentações Recentes</span>
                  </div>
                  <div className="space-y-2">
                    {item.movements.slice(0, 2).map((movement, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                        <div className="flex items-center gap-3">
                          {movement.type === "in" ? (
                            <ArrowUpCircle className="h-4 w-4 text-[#a0bf80]" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <div>
                            <div className="text-sm font-medium">
                              {movement.type === "in" ? "Entrada" : "Saída"} - {movement.quantity} {getUnitLabel(item.unit)}
                            </div>
                            <div className="text-xs text-gray-500">{movement.source}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(movement.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStock.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum item encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
