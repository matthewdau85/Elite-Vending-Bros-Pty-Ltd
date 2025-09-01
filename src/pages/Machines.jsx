
import React, { useState, useEffect } from "react";
import { Machine, Location, MachineStock } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Coffee, 
  MapPin, 
  Wifi, 
  WifiOff,
  Settings,
  AlertTriangle,
  Printer // Added icon
} from "lucide-react";
import { motion } from "framer-motion";

import MachineCard from "../components/machines/MachineCard";
import AddMachineDialog from "../components/machines/AddMachineDialog";

const statusConfig = {
  online: { color: "bg-green-100 text-green-800", icon: Wifi, iconColor: "text-green-600" },
  offline: { color: "bg-red-100 text-red-800", icon: WifiOff, iconColor: "text-red-600" },
  maintenance: { color: "bg-orange-100 text-orange-800", icon: Settings, iconColor: "text-orange-600" },
  retired: { color: "bg-gray-100 text-gray-800", icon: Coffee, iconColor: "text-gray-600" }
};

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [machinesData, locationsData] = await Promise.all([
        Machine.list("-updated_date"),
        Location.list()
      ]);
      setMachines(machinesData);
      setLocations(locationsData);
    } catch (error) {
      console.error("Error loading machines:", error);
    }
    setIsLoading(false);
  };

  const handleAddMachine = async (machineData) => {
    await Machine.create(machineData);
    setShowAddDialog(false);
    loadData();
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = 
      machine.machine_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.location_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || machine.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    return {
      all: machines.length,
      online: machines.filter(m => m.status === "online").length,
      offline: machines.filter(m => m.status === "offline").length,
      maintenance: machines.filter(m => m.status === "maintenance").length,
      retired: machines.filter(m => m.status === "retired").length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Machine Fleet</h1>
            <p className="text-slate-600 mt-1">
              Manage and monitor your vending machines
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fleet Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        statusFilter === status
                          ? "bg-blue-100 border-blue-300 text-blue-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="capitalize">{status}</span>
                      <span className="ml-2 font-semibold">({count})</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search machines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Machines Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMachines.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Coffee className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {machines.length === 0 ? "No Machines Added" : "No Machines Found"}
              </h3>
              <p className="text-slate-500 mb-6">
                {machines.length === 0 
                  ? "Add your first vending machine to get started with fleet management"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {machines.length === 0 && (
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Machine
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map((machine, index) => (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MachineCard 
                  machine={machine}
                  locations={locations}
                  onUpdate={loadData}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Machine Dialog */}
        <AddMachineDialog 
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddMachine}
          locations={locations}
        />
      </div>
    </div>
  );
}
