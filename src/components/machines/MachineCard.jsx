import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  WifiOff, 
  Settings, 
  Coffee, 
  MapPin, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Machine } from "@/api/entities";

const statusConfig = {
  online: { color: "bg-green-100 text-green-800", icon: Wifi, iconColor: "text-green-600" },
  offline: { color: "bg-red-100 text-red-800", icon: WifiOff, iconColor: "text-red-600" },
  maintenance: { color: "bg-orange-100 text-orange-800", icon: Settings, iconColor: "text-orange-600" },
  retired: { color: "bg-gray-100 text-gray-800", icon: Coffee, iconColor: "text-gray-600" }
};

export default function MachineCard({ machine, locations, onUpdate }) {
  const config = statusConfig[machine.status] || statusConfig.online;
  const StatusIcon = config.icon;
  const location = locations.find(l => l.id === machine.location_id);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete machine ${machine.machine_id}? This action cannot be undone.`)) {
      try {
        await Machine.delete(machine.id);
        onUpdate(); // Refresh the machines list
      } catch (error) {
        console.error("Error deleting machine:", error);
        alert("Failed to delete machine. Please try again.");
      }
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-slate-100">
              <StatusIcon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Machine {machine.machine_id}
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {machine.model || "Unknown Model"}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl(`MachineDetail?id=${machine.id}`)} className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Machine
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Machine
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex gap-2">
          <Badge className={config.color}>
            {machine.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location */}
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">
            {location ? location.name : "Unknown Location"}
          </span>
        </div>

        {/* Installation Date */}
        {machine.installation_date && (
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              Installed {format(new Date(machine.installation_date), "MMM d, yyyy")}
            </span>
          </div>
        )}

        {/* Machine Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Type</p>
            <p className="font-medium text-slate-900 capitalize">
              {machine.machine_type}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Slots</p>
            <p className="font-medium text-slate-900">
              {machine.capacity_slots || "N/A"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-4">
          <Link to={createPageUrl(`Inventory?tab=stock&machine=${machine.machine_id}`)} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Stock Status
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}