
import React, { useState, useEffect } from "react";
import { Location, Machine } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Plus,
  Search,
  Building,
  Phone,
  Mail,
  Coffee,
  Trash2,
  Map,
  List
} from "lucide-react";
import DeleteLocationDialog from "../components/locations/DeleteLocationDialog";
import AddLocationDialog from "../components/locations/AddLocationDialog";
import InteractiveLocationMap from "../components/locations/InteractiveLocationMap";
import { safeArray, safeIncludes } from "../components/shared/SearchUtils";
import { useNavigate } from "react-router-dom"; // Added as per outline state section
import { toast } from "sonner"; // Added for toast notifications
import { Toaster } from "@/components/ui/sonner"; // Added for toast notifications
import { trackGA4Event } from "../components/utils/analytics"; // Added as per outline

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // Renamed state variables and added as per outline
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"

  const navigate = useNavigate(); // Added as per outline state section

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
      setLocations(safeArray(locationsData));
      setMachines(safeArray(machinesData));
    } catch (error) {
      console.error("Error loading locations:", error);
      setLocations([]);
      setMachines([]);
      toast.error("Failed to load locations.");
    }
    setIsLoading(false);
  };

  const getMachineCount = (locationId) => {
    return safeArray(machines).filter(m => m.location_id === locationId).length;
  };

  const handleDeleteClick = (location) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLocation) {
      toast.error("No location selected for deletion.");
      return;
    }
    try {
      // Find machines at this location
      const machinesAtLocation = safeArray(machines).filter(
        (m) => m.location_id === selectedLocation.id
      );
      // Unassign machines by setting their location_id to null
      for (const machine of machinesAtLocation) {
        await Machine.update(machine.id, { location_id: null });
      }
      // Delete the location
      await Location.delete(selectedLocation.id);

      toast.success(`Location "${selectedLocation.name}" and its machine associations have been deleted.`);
      trackGA4Event('location_deleted');
      setIsDeleteDialogOpen(false);
      setSelectedLocation(null);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Failed to delete location:", error);
      toast.error("Failed to delete location.");
    }
  };

  const handleAddLocation = async (locationData) => {
    try {
      await Location.create(locationData);
      setIsAddDialogOpen(false);
      await loadData();
      toast.success("Location added successfully!");
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error(`Failed to add location: ${error.message}`);
    }
  };

  const handleLocationUpdate = async (locationId, updateData) => {
    try {
      await Location.update(locationId, updateData);
      await loadData();
      toast.success("Location updated successfully!");
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error(`Failed to update location: ${error.message}`);
    }
  };

  const filteredLocations = safeArray(locations).filter(location =>
    // Updated filter logic as per outline. Removed safeIncludes and address check.
    location?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & View Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />

            <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-sm">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Map View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsContent value="list">
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
          </TabsContent>

          <TabsContent value="map">
            <InteractiveLocationMap
              locations={filteredLocations}
              machines={machines}
              onLocationUpdate={handleLocationUpdate}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {selectedLocation && (
        <DeleteLocationDialog
          location={selectedLocation}
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}

      <AddLocationDialog
        open={isAddDialogOpen} // Changed from isOpen to open
        onClose={() => setIsAddDialogOpen(false)}
        onLocationAdded={handleAddLocation}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
