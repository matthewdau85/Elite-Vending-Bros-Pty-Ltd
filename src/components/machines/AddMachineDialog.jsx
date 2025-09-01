import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

const machineTypes = [
  { value: "snack", label: "Snack Machine" },
  { value: "drink", label: "Drink Machine" },
  { value: "combo", label: "Combo Machine" },
  { value: "coffee", label: "Coffee Machine" },
  { value: "fresh_food", label: "Fresh Food Machine" }
];

export default function AddMachineDialog({ open, onClose, onSubmit, locations }) {
  const [formData, setFormData] = useState({
    machine_id: "",
    location_id: "",
    machine_type: "snack",
    model: "",
    serial_number: "",
    capacity_slots: "",
    installation_date: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submissionData = {
        ...formData,
        capacity_slots: formData.capacity_slots ? parseInt(formData.capacity_slots) : null,
        status: "online"
      };
      
      await onSubmit(submissionData);
      
      // Reset form
      setFormData({
        machine_id: "",
        location_id: "",
        machine_type: "snack",
        model: "",
        serial_number: "",
        capacity_slots: "",
        installation_date: "",
        notes: ""
      });
    } catch (error) {
      console.error("Error adding machine:", error);
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Machine
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="machine_id">Machine ID *</Label>
              <Input
                id="machine_id"
                value={formData.machine_id}
                onChange={(e) => handleChange("machine_id", e.target.value)}
                placeholder="e.g., VM001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location_id">Location *</Label>
              <Select 
                value={formData.location_id} 
                onValueChange={(value) => handleChange("location_id", value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="machine_type">Machine Type</Label>
              <Select 
                value={formData.machine_type} 
                onValueChange={(value) => handleChange("machine_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {machineTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Model/Brand</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange("model", e.target.value)}
                placeholder="e.g., Seaga SM16"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => handleChange("serial_number", e.target.value)}
                placeholder="Serial number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity_slots">Capacity (Slots)</Label>
              <Input
                id="capacity_slots"
                type="number"
                min="1"
                value={formData.capacity_slots}
                onChange={(e) => handleChange("capacity_slots", e.target.value)}
                placeholder="e.g., 48"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="installation_date">Installation Date</Label>
            <Input
              id="installation_date"
              type="date"
              value={formData.installation_date}
              onChange={(e) => handleChange("installation_date", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes about this machine..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.machine_id || !formData.location_id}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Adding..." : "Add Machine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}