
import React, { useState, useEffect } from "react";
import { Location, Machine } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Plus, 
  Search, 
  Building,
  Phone,
  Mail,
  Coffee,
  Trash2
} from "lucide-react";
import DeleteLocationDialog from "../components/locations/DeleteLocationDialog";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingLocation, setDeletingLocation] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [locationsData, machinesData] = await Promise.all([
        Location.list(),
        Machine.list()
      ]);
      setLocations(locationsData);
      setMachines(machinesData);
    } catch (error) {
      console.error("Error loading locations:", error);
    }
    setIsLoading(false);
  };

  const getMachineCount = (locationId) => {
    return machines.filter(m => m.location_id === locationId).length;
  };
  
  const handleDeleteClick = (location) => {
    setDeletingLocation(location);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async (locationId) => {
    const machineCount = getMachineCount(locationId);
    if (machineCount > 0) {
      console.warn(`Cannot delete location. It has ${machineCount} machine(s) assigned to it. Please re-assign them first.`);
      // This was the bug. The dialog needs to close even if deletion is blocked.
      setShowDeleteDialog(false);
      setDeletingLocation(null);
      return;
    }
    
    try {
      await Location.delete(locationId);
      setShowDeleteDialog(false);
      setDeletingLocation(null);
      await loadData(); // Reload data to reflect changes
      console.log("Location deleted successfully - proper toast UI should be added");
    } catch (error) {
      console.error("Error deleting location:", error);
      console.error(`Failed to delete location: ${error.message} - proper error toast UI should be added`);
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Location Management</h1>
            <p className="text-slate-600 mt-1">
              Manage vending machine locations and site contacts
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredLocations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    <Badge className={location.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {location.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building className="w-4 h-4" />
                    <span>{location.location_type}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span className="leading-relaxed">{location.address}</span>
                  </div>
                  {location.contact_person && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{location.contact_person}</span>
                    </div>
                  )}
                  {location.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span>{location.contact_email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Coffee className="w-4 h-4" />
                    <span>{getMachineCount(location.id)} machines</span>
                  </div>
                </CardContent>
                <div className="p-4 border-t mt-auto">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleDeleteClick(location)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Location
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {filteredLocations.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Locations Found</h3>
              <p className="text-slate-500">Add your first location to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <DeleteLocationDialog 
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        location={deletingLocation}
      />
    </div>
  );
}
