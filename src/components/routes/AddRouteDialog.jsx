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
import { User, Machine } from "@/api/entities";

export default function AddRouteDialog({ open, onClose, onSubmit, route }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    assigned_operator: "",
    machine_ids: [],
    next_scheduled: "",
    frequency: "weekly"
  });
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPrerequisites = async () => {
      const [usersData, machinesData] = await Promise.all([User.list(), Machine.list()]);
      setUsers(usersData);
      setMachines(machinesData);
    };
    if (open) {
      loadPrerequisites();
      if (route) {
        setFormData({
          name: route.name || "",
          description: route.description || "",
          assigned_operator: route.assigned_operator || "",
          machine_ids: route.machine_ids || [],
          next_scheduled: route.next_scheduled ? route.next_scheduled.split('T')[0] : "",
          frequency: route.frequency || "weekly"
        });
      } else {
        setFormData({
          name: "",
          description: "",
          assigned_operator: "",
          machine_ids: [],
          next_scheduled: "",
          frequency: "weekly"
        });
      }
    }
  }, [open, route]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
    onClose();
  };

  const handleMachineSelect = (machineId) => {
    setFormData(prev => {
      const newMachineIds = new Set(prev.machine_ids);
      if (newMachineIds.has(machineId)) {
        newMachineIds.delete(machineId);
      } else {
        newMachineIds.add(machineId);
      }
      return { ...prev, machine_ids: Array.from(newMachineIds) };
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{route ? "Edit Route" : "Create New Route"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Route Name *</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigned_operator">Assign Operator</Label>
              <Select value={formData.assigned_operator} onValueChange={(val) => handleChange("assigned_operator", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an operator" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(val) => handleChange("frequency", val)}>
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
            <Input id="next_scheduled" type="date" value={formData.next_scheduled} onChange={(e) => handleChange("next_scheduled", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Assign Machines</Label>
            <ScrollArea className="h-48 border rounded-md p-4">
              <div className="space-y-2">
                {machines.map(machine => (
                  <div key={machine.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`machine-${machine.id}`}
                      checked={formData.machine_ids.includes(machine.id)}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (route ? "Save Changes" : "Create Route")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}