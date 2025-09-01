
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Machine, MachineStock, Product, Location, Visit, Alert } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Coffee, 
  MapPin, 
  Calendar, 
  Wifi, 
  WifiOff, 
  Settings as SettingsIcon,
  Package,
  AlertTriangle,
  History,
  Printer
} from "lucide-react";
import { format } from "date-fns";

export default function MachineDetail() {
  const [machine, setMachine] = useState(null);
  const [location, setLocation] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [visits, setVisits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadMachineData = useCallback(async (machineId) => {
    setIsLoading(true);
    try {
      const [machineData, stocksData, productsData, visitsData, alertsData] = await Promise.all([
        Machine.filter({ id: machineId }),
        MachineStock.filter({ machine_id: machineId }),
        Product.list(),
        Visit.filter({ machine_id: machineId }, "-visit_datetime", 10),
        Alert.filter({ machine_id: machineId }, "-alert_datetime", 10)
      ]);

      if (machineData.length === 0) {
        navigate(createPageUrl("Machines"));
        return;
      }

      const machineRecord = machineData[0];
      setMachine(machineRecord);
      setStocks(stocksData);
      setProducts(productsData);
      setVisits(visitsData);
      setAlerts(alertsData);

      // Load location data
      if (machineRecord.location_id) {
        const locationData = await Location.filter({ id: machineRecord.location_id });
        setLocation(locationData[0] || null);
      }
    } catch (error) {
      console.error("Error loading machine data:", error);
    }
    setIsLoading(false);
  }, [navigate]); // Added navigate as a dependency for useCallback

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const machineId = urlParams.get('id');
    if (machineId) {
      loadMachineData(machineId);
    } else {
      navigate(createPageUrl("Machines"));
    }
  }, [navigate, loadMachineData]); // Added loadMachineData to useEffect dependencies

  const statusConfig = {
    online: { color: "bg-green-100 text-green-800", icon: Wifi },
    offline: { color: "bg-red-100 text-red-800", icon: WifiOff },
    maintenance: { color: "bg-orange-100 text-orange-800", icon: SettingsIcon },
    retired: { color: "bg-gray-100 text-gray-800", icon: Coffee }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-slate-200 rounded"></div>
              <div className="h-48 bg-slate-200 rounded"></div>
              <div className="h-48 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!machine) return null;

  const config = statusConfig[machine.status] || statusConfig.online;
  const StatusIcon = config.icon;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(createPageUrl("Machines"))}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Machines
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Machine {machine.machine_id}</h1>
              <p className="text-slate-600 mt-1">{machine.model || "Unknown Model"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Machine Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-100">
                  <StatusIcon className="w-6 h-6 text-slate-600" />
                </div>
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={config.color}>{machine.status}</Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-100">
                  <MapPin className="w-6 h-6 text-slate-600" />
                </div>
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{location?.name || "Unknown Location"}</p>
              <p className="text-sm text-slate-500">{location?.address}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-100">
                  <Calendar className="w-6 h-6 text-slate-600" />
                </div>
                Installation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {machine.installation_date 
                  ? format(new Date(machine.installation_date), "MMM d, yyyy")
                  : "Not specified"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stock">
              <Package className="w-4 h-4 mr-2" />
              Stock Status
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="visits">
              <History className="w-4 h-4 mr-2" />
              Visit History
            </TabsTrigger>
            <TabsTrigger value="details">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Current Stock Levels</CardTitle>
              </CardHeader>
              <CardContent>
                {stocks.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No stock data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stocks.map((stock) => {
                      const product = products.find(p => p.sku === stock.product_sku);
                      const isLowStock = stock.current_stock <= (stock.par_level || 0);
                      
                      return (
                        <div key={stock.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{product?.name || stock.product_sku}</h4>
                            <p className="text-sm text-slate-500">Slot {stock.slot_number}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                              {stock.current_stock}/{stock.capacity}
                            </p>
                            {isLowStock && (
                              <Badge className="bg-red-100 text-red-800 text-xs">Low Stock</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <p className="text-slate-500">No alerts for this machine</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-slate-600">{alert.description}</p>
                            <p className="text-xs text-slate-500 mt-2">
                              {format(new Date(alert.alert_datetime), "MMM d, yyyy h:mm a")}
                            </p>
                          </div>
                          <Badge className={`${alert.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {alert.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visits" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Visit History</CardTitle>
              </CardHeader>
              <CardContent>
                {visits.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No visits recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits.map((visit) => (
                      <div key={visit.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium capitalize">{visit.visit_type?.replace('_', ' ')}</h4>
                            <p className="text-sm text-slate-600">by {visit.operator}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {format(new Date(visit.visit_datetime), "MMM d, yyyy h:mm a")}
                            </p>
                          </div>
                          <Badge variant="outline">{visit.status}</Badge>
                        </div>
                        {visit.notes && (
                          <p className="text-sm text-slate-600 mt-2">{visit.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Machine Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900">Machine ID</h4>
                      <p className="text-slate-600">{machine.machine_id}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Type</h4>
                      <p className="text-slate-600 capitalize">{machine.machine_type}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Model</h4>
                      <p className="text-slate-600">{machine.model || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Serial Number</h4>
                      <p className="text-slate-600">{machine.serial_number || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900">Capacity</h4>
                      <p className="text-slate-600">{machine.capacity_slots || "Not specified"} slots</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Installation Date</h4>
                      <p className="text-slate-600">
                        {machine.installation_date 
                          ? format(new Date(machine.installation_date), "MMMM d, yyyy")
                          : "Not specified"
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Last Service</h4>
                      <p className="text-slate-600">
                        {machine.last_service_date 
                          ? format(new Date(machine.last_service_date), "MMMM d, yyyy")
                          : "Not recorded"
                        }
                      </p>
                    </div>
                  </div>
                </div>
                {machine.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-slate-900 mb-2">Notes</h4>
                    <p className="text-slate-600">{machine.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
