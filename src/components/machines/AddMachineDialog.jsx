import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Machine, Location } from "@/api/entities";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { withTenantScope, withTenantFilters, TenantAccessError } from '@/lib/tenantContext';

export default function AddMachineDialog({ onMachineAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    machine_id: "",
    location_id: "",
    machine_type: "snack",
    model: "",
    serial_number: "",
    status: "online"
  });

  React.useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await Location.list({ filter: withTenantFilters() });
        setLocations(data || []);
      } catch (error) {
        if (error instanceof TenantAccessError) {
          toast.error("You do not have permission to view locations for this tenant.");
        }
        console.error("Error loading locations:", error);
      }
    };
    loadLocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const machine = await Machine.create(withTenantScope(formData));
      toast.success("Machine added successfully!");
      setOpen(false);
      setFormData({
        machine_id: "",
        location_id: "",
        machine_type: "snack",
        model: "",
        serial_number: "",
        status: "online"
      });
      onMachineAdded?.(machine);
    } catch (error) {
      toast.error("Failed to add machine. Please try again.");
      console.error("Error adding machine:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Machine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Machine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="machine_id">Machine ID *</Label>
              <Input
                id="machine_id"
                placeholder="M001"
                value={formData.machine_id}
                onChange={(e) => setFormData(prev => ({...prev, machine_id: e.target.value}))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.location_id}
                onValueChange={(value) => setFormData(prev => ({...prev, location_id: value}))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="machine_type">Type</Label>
              <Select
                value={formData.machine_type}
                onValueChange={(value) => setFormData(prev => ({...prev, machine_type: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="drink">Drink</SelectItem>
                  <SelectItem value="combo">Combo</SelectItem>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="fresh_food">Fresh Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="AMS Sensit III"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({...prev, model: e.target.value}))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serial_number">Serial Number</Label>
            <Input
              id="serial_number"
              placeholder="SN123456789"
              value={formData.serial_number}
              onChange={(e) => setFormData(prev => ({...prev, serial_number: e.target.value}))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Machine"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}