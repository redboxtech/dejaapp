import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { 
  Bell, 
  Clock, 
  Package, 
  Calendar,
  Mail,
  Smartphone,
  MessageSquare,
  Save
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import { apiFetch } from "../lib/api";
import { useAuth } from "./AuthContext";

export function AlertsPage() {
  const { currentUser } = useAuth();
  const [alertSettings, setAlertSettings] = useState({
    medicationDelay: {
      enabled: true,
      delayMinutes: 30,
      channels: ["push", "email"]
    },
    lowStock: {
      enabled: true,
      threshold: 7,
      channels: ["push", "email"]
    },
    criticalStock: {
      enabled: true,
      threshold: 3,
      channels: ["push", "email", "whatsapp"]
    },
    prescriptionExpiry: {
      enabled: true,
      defaultDays: 14,
      channels: ["push", "email"]
    },
    replenishmentRequest: {
      enabled: true,
      channels: ["push", "email"]
    },
    quietHours: {
      enabled: true,
      startTime: "22:00",
      endTime: "07:00"
    }
  });

  const [prescriptionRules, setPrescriptionRules] = useState([
    { id: "1", type: "C1", name: "Controlados C1", daysBeforeExpiry: 30 },
    { id: "2", type: "C2", name: "Controlados C2", daysBeforeExpiry: 30 },
    { id: "3", type: "B", name: "Controlados B", daysBeforeExpiry: 15 },
    { id: "4", type: "Simple", name: "Receita Simples", daysBeforeExpiry: 7 },
  ]);

  // Carregar configurações ao montar o componente
  useEffect(() => {
    if (currentUser) {
      loadAlertSettings();
    }
  }, [currentUser]);

  const loadAlertSettings = async () => {
    try {
      const settings = await apiFetch<any>(`/alerts/settings`);
      if (settings) {
        setAlertSettings({
          medicationDelay: {
            enabled: settings.medicationDelayEnabled ?? true,
            delayMinutes: settings.medicationDelayMinutes ?? 30,
            channels: settings.medicationDelayChannels ?? ["push", "email"]
          },
          lowStock: {
            enabled: settings.lowStockEnabled ?? true,
            threshold: settings.lowStockThreshold ?? 7,
            channels: settings.lowStockChannels ?? ["push", "email"]
          },
          criticalStock: {
            enabled: settings.criticalStockEnabled ?? true,
            threshold: settings.criticalStockThreshold ?? 3,
            channels: settings.criticalStockChannels ?? ["push", "email", "whatsapp"]
          },
          prescriptionExpiry: {
            enabled: settings.prescriptionExpiryEnabled ?? true,
            defaultDays: settings.prescriptionExpiryDefaultDays ?? 14,
            channels: settings.prescriptionExpiryChannels ?? ["push", "email"]
          },
          replenishmentRequest: {
            enabled: settings.replenishmentRequestEnabled ?? true,
            channels: settings.replenishmentRequestChannels ?? ["push", "email"]
          },
          quietHours: {
            enabled: settings.quietHoursEnabled ?? true,
            startTime: settings.quietHoursStartTime ?? "22:00",
            endTime: settings.quietHoursEndTime ?? "07:00"
          }
        });
      }
    } catch (e) {
      console.error('Erro ao carregar configurações de alertas', e);
    }
  };

  const handleSave = async () => {
    try {
      await apiFetch(`/alerts/settings`, {
        method: 'PUT',
        body: JSON.stringify({
          medicationDelayEnabled: alertSettings.medicationDelay.enabled,
          medicationDelayMinutes: alertSettings.medicationDelay.delayMinutes,
          medicationDelayChannels: alertSettings.medicationDelay.channels,
          lowStockEnabled: alertSettings.lowStock.enabled,
          lowStockThreshold: alertSettings.lowStock.threshold,
          lowStockChannels: alertSettings.lowStock.channels,
          criticalStockEnabled: alertSettings.criticalStock.enabled,
          criticalStockThreshold: alertSettings.criticalStock.threshold,
          criticalStockChannels: alertSettings.criticalStock.channels,
          prescriptionExpiryEnabled: alertSettings.prescriptionExpiry.enabled,
          prescriptionExpiryDefaultDays: alertSettings.prescriptionExpiry.defaultDays,
          prescriptionExpiryChannels: alertSettings.prescriptionExpiry.channels,
          replenishmentRequestEnabled: alertSettings.replenishmentRequest.enabled,
          replenishmentRequestChannels: alertSettings.replenishmentRequest.channels,
          quietHoursEnabled: alertSettings.quietHours.enabled,
          quietHoursStartTime: alertSettings.quietHours.startTime,
          quietHoursEndTime: alertSettings.quietHours.endTime
        }),
      });
      toast.success("Configurações de alertas salvas com sucesso!");
    } catch (e) {
      console.error('Erro ao salvar configurações de alertas', e);
      toast.error("Erro ao salvar configurações de alertas.");
    }
  };

  const toggleChannel = (alertType: string, channel: string) => {
    setAlertSettings(prev => {
      const alert = prev[alertType as keyof typeof prev] as any;
      const channels = alert.channels || [];
      const newChannels = channels.includes(channel)
        ? channels.filter((c: string) => c !== channel)
        : [...channels, channel];
      
      return {
        ...prev,
        [alertType]: {
          ...alert,
          channels: newChannels
        }
      };
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#16808c]">Configuração de Alertas</h1>
        <p className="text-gray-600 mt-1">
          Configure quando e como você deseja receber notificações
        </p>
      </div>

      {/* Medication Delay Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f2c36b]/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#f2c36b]" />
              </div>
              <div>
                <CardTitle className="text-[#16808c]">Atraso na Medicação</CardTitle>
                <CardDescription>
                  Alertas quando uma dose não for administrada no horário
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={alertSettings.medicationDelay.enabled}
              onCheckedChange={(checked) =>
                setAlertSettings({
                  ...alertSettings,
                  medicationDelay: { ...alertSettings.medicationDelay, enabled: checked }
                })
              }
            />
          </div>
        </CardHeader>
        {alertSettings.medicationDelay.enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label>Tempo de tolerância (minutos)</Label>
              <Input
                type="number"
                value={alertSettings.medicationDelay.delayMinutes}
                onChange={(e) =>
                  setAlertSettings({
                    ...alertSettings,
                    medicationDelay: {
                      ...alertSettings.medicationDelay,
                      delayMinutes: parseInt(e.target.value)
                    }
                  })
                }
                className="max-w-xs"
              />
              <p className="text-sm text-gray-500 mt-1">
                Alertar após este período sem administração
              </p>
            </div>
            <div>
              <Label className="mb-3 block">Canais de Notificação</Label>
              <div className="flex gap-3">
                <Button
                  variant={alertSettings.medicationDelay.channels.includes("push") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel("medicationDelay", "push")}
                  className={alertSettings.medicationDelay.channels.includes("push") ? "bg-[#16808c]" : ""}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  App
                </Button>
                <Button
                  variant={alertSettings.medicationDelay.channels.includes("email") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel("medicationDelay", "email")}
                  className={alertSettings.medicationDelay.channels.includes("email") ? "bg-[#16808c]" : ""}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail
                </Button>
                <Button
                  variant={alertSettings.medicationDelay.channels.includes("whatsapp") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel("medicationDelay", "whatsapp")}
                  className={alertSettings.medicationDelay.channels.includes("whatsapp") ? "bg-[#16808c]" : ""}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f2c36b]/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-[#f2c36b]" />
              </div>
              <div>
                <CardTitle className="text-[#16808c]">Estoque Baixo</CardTitle>
                <CardDescription>
                  Alertas quando o estoque estiver próximo do fim
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={alertSettings.lowStock.enabled}
              onCheckedChange={(checked) =>
                setAlertSettings({
                  ...alertSettings,
                  lowStock: { ...alertSettings.lowStock, enabled: checked }
                })
              }
            />
          </div>
        </CardHeader>
        {alertSettings.lowStock.enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label>Dias de estoque restante</Label>
              <Input
                type="number"
                value={alertSettings.lowStock.threshold}
                onChange={(e) =>
                  setAlertSettings({
                    ...alertSettings,
                    lowStock: { ...alertSettings.lowStock, threshold: parseInt(e.target.value) }
                  })
                }
                className="max-w-xs"
              />
              <p className="text-sm text-gray-500 mt-1">
                Alertar quando houver menos dias de estoque que este valor
              </p>
            </div>
            <div>
              <Label className="mb-3 block">Canais de Notificação</Label>
              <div className="flex gap-3">
                <Button
                  variant={alertSettings.lowStock.channels.includes("push") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel("lowStock", "push")}
                  className={alertSettings.lowStock.channels.includes("push") ? "bg-[#16808c]" : ""}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  App
                </Button>
                <Button
                  variant={alertSettings.lowStock.channels.includes("email") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel("lowStock", "email")}
                  className={alertSettings.lowStock.channels.includes("email") ? "bg-[#16808c]" : ""}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Critical Stock Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#a61f43]/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-[#a61f43]" />
              </div>
              <div>
                <CardTitle className="text-[#16808c]">Estoque Crítico</CardTitle>
                <CardDescription>
                  Alertas urgentes quando o estoque estiver acabando
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={alertSettings.criticalStock.enabled}
              onCheckedChange={(checked) =>
                setAlertSettings({
                  ...alertSettings,
                  criticalStock: { ...alertSettings.criticalStock, enabled: checked }
                })
              }
            />
          </div>
        </CardHeader>
        {alertSettings.criticalStock.enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label>Dias de estoque restante</Label>
              <Input
                type="number"
                value={alertSettings.criticalStock.threshold}
                onChange={(e) =>
                  setAlertSettings({
                    ...alertSettings,
                    criticalStock: {
                      ...alertSettings.criticalStock,
                      threshold: parseInt(e.target.value)
                    }
                  })
                }
                className="max-w-xs"
              />
              <p className="text-sm text-gray-500 mt-1">
                Alertar urgentemente quando houver menos dias que este valor
              </p>
            </div>
            <div>
              <Label className="mb-3 block">Canais de Notificação</Label>
              <div className="flex gap-3">
                <Button
                  variant={alertSettings.criticalStock.channels.includes("push") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel("criticalStock", "push")}
                  className={alertSettings.criticalStock.channels.includes("push") ? "bg-[#16808c]" : ""}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  App
                </Button>
                <Button
                  variant={alertSettings.criticalStock.channels.includes("email") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel("criticalStock", "email")}
                  className={alertSettings.criticalStock.channels.includes("email") ? "bg-[#16808c]" : ""}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail
                </Button>
                <Button
                  variant={alertSettings.criticalStock.channels.includes("whatsapp") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel("criticalStock", "whatsapp")}
                  className={alertSettings.criticalStock.channels.includes("whatsapp") ? "bg-[#16808c]" : ""}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Prescription Expiry Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6cced9]/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#16808c]" />
              </div>
              <div>
                <CardTitle className="text-[#16808c]">Receitas Vencendo</CardTitle>
                <CardDescription>
                  Alertas para renovar receitas antes do vencimento
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={alertSettings.prescriptionExpiry.enabled}
              onCheckedChange={(checked) =>
                setAlertSettings({
                  ...alertSettings,
                  prescriptionExpiry: { ...alertSettings.prescriptionExpiry, enabled: checked }
                })
              }
            />
          </div>
        </CardHeader>
        {alertSettings.prescriptionExpiry.enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label>Antecedência padrão (dias)</Label>
              <Input
                type="number"
                value={alertSettings.prescriptionExpiry.defaultDays}
                onChange={(e) =>
                  setAlertSettings({
                    ...alertSettings,
                    prescriptionExpiry: {
                      ...alertSettings.prescriptionExpiry,
                      defaultDays: parseInt(e.target.value)
                    }
                  })
                }
                className="max-w-xs"
              />
              <p className="text-sm text-gray-500 mt-1">
                Alertar com quantos dias de antecedência (padrão)
              </p>
            </div>

            <Separator />

            <div>
              <Label className="mb-3 block">Regras por Tipo de Receita</Label>
              <div className="space-y-3">
                {prescriptionRules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-gray-500">Tipo {rule.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={rule.daysBeforeExpiry}
                        onChange={(e) => {
                          const newRules = prescriptionRules.map(r =>
                            r.id === rule.id
                              ? { ...r, daysBeforeExpiry: parseInt(e.target.value) }
                              : r
                          );
                          setPrescriptionRules(newRules);
                        }}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">dias</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Canais de Notificação</Label>
              <div className="flex gap-3">
                <Button
                  variant={alertSettings.prescriptionExpiry.channels.includes("push") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel("prescriptionExpiry", "push")}
                  className={alertSettings.prescriptionExpiry.channels.includes("push") ? "bg-[#16808c]" : ""}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  App
                </Button>
                <Button
                  variant={alertSettings.prescriptionExpiry.channels.includes("email") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChannel("prescriptionExpiry", "email")}
                  className={alertSettings.prescriptionExpiry.channels.includes("email") ? "bg-[#16808c]" : ""}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Bell className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-[#16808c]">Modo Silencioso</CardTitle>
                <CardDescription>
                  Defina horários para não receber notificações
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={alertSettings.quietHours.enabled}
              onCheckedChange={(checked) =>
                setAlertSettings({
                  ...alertSettings,
                  quietHours: { ...alertSettings.quietHours, enabled: checked }
                })
              }
            />
          </div>
        </CardHeader>
        {alertSettings.quietHours.enabled && (
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Horário de Início</Label>
                <Input
                  type="time"
                  value={alertSettings.quietHours.startTime}
                  onChange={(e) =>
                    setAlertSettings({
                      ...alertSettings,
                      quietHours: { ...alertSettings.quietHours, startTime: e.target.value }
                    })
                  }
                />
              </div>
              <div>
                <Label>Horário de Término</Label>
                <Input
                  type="time"
                  value={alertSettings.quietHours.endTime}
                  onChange={(e) =>
                    setAlertSettings({
                      ...alertSettings,
                      quietHours: { ...alertSettings.quietHours, endTime: e.target.value }
                    })
                  }
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Alertas críticos ainda serão enviados durante este período
            </p>
          </CardContent>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button 
          className="bg-[#16808c] hover:bg-[#16808c]/90"
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
