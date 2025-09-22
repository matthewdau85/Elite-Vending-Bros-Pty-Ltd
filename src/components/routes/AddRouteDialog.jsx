
import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

// Updated props: 'users' removed, 'locations' added.
// The 'route' prop has been removed, as this component is now solely for creating new routes.
export default function AddRouteDialog({ open, onClose, onRouteAdded, machines, locations }) {
  // Individual state variables for form fields, replacing the single formData object
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // 'assignedOperator' state removed, 'location' state added
  const [location, setLocation] = useState(""); // New state for location
  const [machineIds, setMachineIds] = useState([]);
  const [nextScheduled, setNextScheduled] = useState("");
  const [frequency, setFrequency] = useState("weekly");

  // Renamed isSubmitting to isLoading for broader use case (e.g., fetching data, submitting)
  const [isLoading, setIsLoading] = useState(false);

  // Effect to reset form fields when the dialog opens (or closes)
  useEffect(() => {
    if (!open) {
      // Reset form fields to their initial empty state when the dialog is closed
      setName("");
      setDescription("");
      setLocation(""); // Reset new location state
      setMachineIds([]);
      setNextScheduled("");
      setFrequency("weekly");
    }
    // No need to load users/machines or pre-fill 'route' data as they are now props
    // and this dialog is specifically for new route creation.
  }, [open]);

  // Handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission to handle it with React

    setIsLoading(true); // Set loading state to true during submission
    try {
      const newRouteData = {
        name,
        description,
        // 'assigned_operator' removed, 'location' field added to payload
        location: location,
        machine_ids: machineIds,
        next_scheduled: nextScheduled,
        frequency,
      };
      await onRouteAdded(newRouteData); // Call the onRouteAdded prop with the new data
      toast.success("Route created successfully!"); // Show success toast
      onClose(); // Close the dialog after successful creation
      // Form fields are automatically reset by the useEffect when 'open' becomes false after onClose()
    } catch (error) {
      console.error("Failed to create route:", error);
      toast.error("Failed to create route. Please try again."); // Show error toast
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Handles the selection/deselection of machines using checkboxes
  const handleMachineSelect = (machineId) => {
    setMachineIds(prev => {
      const newMachineIds = new Set(prev); // Use a Set for efficient add/delete
      if (newMachineIds.has(machineId)) {
        newMachineIds.delete(machineId); // Remove if already selected
      } else {
        newMachineIds.add(machineId); // Add if not selected
      }
      return Array.from(newMachineIds); // Convert back to array for state
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg"> {/* Changed max-w-2xl to max-w-lg */}
        <DialogHeader>
          {/* Dialog title is now static "Create New Route" as it no longer supports editing */}
          <DialogTitle>Create New Route</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Route Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Replaced 'Assign Operator' with 'Assign Location' */}
            <div className="space-y-2">
              <Label htmlFor="location">Assign Location</Label>
              <Select
                value={location}
                onValueChange={setLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {/* Map over locations passed via props */}
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={frequency}
                onValueChange={setFrequency}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="as_needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_scheduled">Next Scheduled Date</Label>
            <Input
              id="next_scheduled"
              type="date"
              value={nextScheduled}
              onChange={(e) => setNextScheduled(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Assign Machines</Label>
            <ScrollArea className="h-48 border rounded-md p-4">
              <div className="space-y-2">
                {/* Map over machines passed via props */}
                {machines.map(machine => (
                  <div key={machine.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`machine-${machine.id}`}
                      checked={machineIds.includes(machine.id)}
                      onCheckedChange={() => handleMachineSelect(machine.id)}
                    />
                    <Label htmlFor={`machine-${machine.id}`}>Machine {machine.machine_id}</Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {/* Button text reflects the loading state for creation */}
              {isLoading ? "Creating..." : "Create Route"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
