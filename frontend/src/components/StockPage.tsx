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
    price: "",
    totalInstallments: ""
  });

  // Memoized filtered stock
  const filteredStock = useMemo(() => {
    return stockItems.filter(item =>
      item.medication.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!newStock.medicationId || !newStock.quantity || !newStock.source) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const quantity = parseFloat(newStock.quantity);
    let source = "";
    
    // Mapear origem para o texto correto
    switch (newStock.source) {
      case "health_post":
        source = "Posto de Saúde";
        break;
      case "pharmacy":
        source = "Farmácia";
        break;
      case "health_secretary":
        source = "Secretaria de Saúde";
        break;
      case "free_sample":
        source = "Amostra Grátis";
        break;
      default:
        source = newStock.source;
    }

    // Obter o preço (se fornecido) - apenas para Farmácia
    const price = newStock.source === "pharmacy" && newStock.price && newStock.price.trim() !== ""
      ? parseFloat(newStock.price)
      : null;

    // Obter o número de parcelas (se fornecido) - apenas para Farmácia
    const totalInstallments = newStock.source === "pharmacy" && newStock.totalInstallments && newStock.totalInstallments.trim() !== ""
      ? parseInt(newStock.totalInstallments)
      : null;

    addStockEntry(newStock.medicationId, quantity, source, price, totalInstallments);
    toast.success("Entrada de estoque registrada com sucesso!");
    setIsAddStockOpen(false);
    setNewStock({ medicationId: "", quantity: "", source: "", price: "", totalInstallments: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-[#a61f43]";
      case "warning": return "bg-[#f2c36b]";
      default: return "bg-[#a0bf80]";
    }
  };

  const getProgressValue = (current: number, dailyConsumption: number) => {
    // Validar valores numéricos
    const currentNum = typeof current === 'number' ? current : parseFloat(String(current || 0));
    const dailyConsumptionNum = typeof dailyConsumption === 'number' ? dailyConsumption : parseFloat(String(dailyConsumption || 0));
    
    // Verificar se são números válidos
    if (isNaN(currentNum) || isNaN(dailyConsumptionNum)) return 0;
    
    // Calcular consumo mensal (30 dias)
    const monthlyConsumption = dailyConsumptionNum * 30;
    if (monthlyConsumption === 0) return 0;
    
    // Calcular porcentagem baseada no consumo mensal (pode ser acima de 100%)
    const percentage = (currentNum / monthlyConsumption) * 100;
    return isNaN(percentage) ? 0 : percentage;
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
                        {med.name} {med.dosage}{getUnitLabel(med.dosageUnit || med.unit)} ({getUnitLabel(med.presentationForm || med.unit)})
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
                  onValueChange={(value) => setNewStock({ ...newStock, source: value, price: "", totalInstallments: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health_post">Posto de Saúde</SelectItem>
                    <SelectItem value="pharmacy">Farmácia</SelectItem>
                    <SelectItem value="health_secretary">Secretaria de Saúde</SelectItem>
                    <SelectItem value="free_sample">Amostra Grátis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStock.source === "pharmacy" && (
                <>
                  <div>
                    <Label htmlFor="price">Preço Total (opcional)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newStock.price}
                      onChange={(e) => setNewStock({ ...newStock, price: e.target.value })}
                      placeholder="Ex: 45.50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Informe o preço total pago na farmácia (opcional)</p>
                  </div>
                  {newStock.price && newStock.price.trim() !== "" && (
                    <div>
                      <Label htmlFor="totalInstallments">Número de Parcelas (opcional)</Label>
                      <Input
                        id="totalInstallments"
                        type="number"
                        min="1"
                        max="12"
                        value={newStock.totalInstallments}
                        onChange={(e) => setNewStock({ ...newStock, totalInstallments: e.target.value })}
                        placeholder="Ex: 3"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {newStock.totalInstallments && parseInt(newStock.totalInstallments) > 0
                          ? `Valor da parcela: R$ ${(parseFloat(newStock.price) / parseInt(newStock.totalInstallments)).toFixed(2)}`
                          : "Deixe em branco para compra à vista"}
                      </p>
                    </div>
                  )}
                </>
              )}
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
                  </div>
                  <Badge className={`${getStatusColor(item.status)} text-white`}>
                    {item.status === "critical" ? "Crítico" : item.status === "warning" ? "Atenção" : "Normal"}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estoque atual: {item.current} {getUnitLabel(item.presentationForm || item.unit)}</span>
                    <span className="font-medium">{Math.round(getProgressValue(item.current, item.dailyConsumption))}% do consumo mensal</span>
                  </div>
                  <Progress 
                    value={Math.min(getProgressValue(item.current, item.dailyConsumption), 100)}
                    className="h-3"
                  />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="border-l-4 border-[#16808c] pl-3">
                    <div className="text-xs text-gray-500 mb-1">Estoque Atual</div>
                    <div className="font-bold text-lg text-[#16808c]">{item.current} {getUnitLabel(item.presentationForm || item.unit)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Consumo Diário</div>
                    <div className="font-medium">{item.dailyConsumption} {getUnitLabel(item.presentationForm || item.unit)}</div>
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
                    <div className="font-medium">{item.boxQuantity} {getUnitLabel(item.presentationForm || item.unit)}</div>
                  </div>
                </div>

                {/* Última Entrada */}
                {item.movements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <History className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm text-gray-700">Última Entrada</span>
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded">
                      {(() => {
                        const lastEntry = item.movements
                          .filter(m => m.type === "in")
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                        
                        if (!lastEntry) return null;
                        
                        return (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ArrowUpCircle className="h-4 w-4 text-[#a0bf80]" />
                              <div>
                                <div className="text-sm font-medium">
                                  {lastEntry.quantity} {getUnitLabel(item.presentationForm || item.unit)}
                                </div>
                                <div className="text-xs text-gray-500">{lastEntry.source}</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(lastEntry.date).toLocaleString('pt-BR', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
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
