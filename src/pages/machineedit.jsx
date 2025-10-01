import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Machine, Location } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { withTenantScope, withTenantFilters, TenantAccessError } from '@/lib/tenantContext';

const machineTypes = [
  { value: 'snack', label: 'Snack Machine' },
  { value: 'drink', label: 'Drink Machine' },
  { value: 'combo', label: 'Combo Machine' },
  { value: 'coffee', label: 'Coffee Machine' },
  { value: 'fresh_food', label: 'Fresh Food Machine' },
];

const machineStatuses = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
];

export default function MachineEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const [machine, setMachine] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getMachineId = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get('id');
  }, [location.search]);

  useEffect(() => {
    const machineId = getMachineId();
    if (!machineId) {
      toast.error('No machine ID provided');
      navigate('/machines');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [machineData, locationsData] = await Promise.all([
          Machine.get(machineId),
          Location.list({ filter: withTenantFilters() }),
        ]);
        setMachine(machineData);
        setLocations(locationsData);
      } catch (error) {
        if (error instanceof TenantAccessError) {
          toast.error('You are not authorized to modify this machine.');
        } else {
          toast.error('Failed to load machine data');
        }
        console.error(error);
        navigate('/machines');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, getMachineId]);
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setMachine((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field, value) => {
    setMachine((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Machine.update(machine.id, withTenantScope({ ...machine }));
      toast.success('Machine updated successfully!');
      navigate(`/machinedetail?id=${machine.id}`);
    } catch (error) {
      if (error instanceof TenantAccessError) {
        toast.error('You are not authorized to update this machine.');
      } else {
        toast.error('Failed to update machine.');
      }
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading machine details..." />;
  }

  if (!machine) {
    return <div>Machine not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Machine {machine.machine_id}</CardTitle>
            <CardDescription>Update the details for this vending machine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="machine_id">Machine ID</Label>
                <Input id="machine_id" value={machine.machine_id} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_id">Location</Label>
                <Select
                  value={machine.location_id || ''}
                  onValueChange={(value) => handleSelectChange('location_id', value)}
                >
                  <SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" value={machine.model || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input id="serial_number" value={machine.serial_number || ''} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label htmlFor="machine_type">Machine Type</Label>
                <Select
                  value={machine.machine_type || ''}
                  onValueChange={(value) => handleSelectChange('machine_type', value)}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={machine.status || ''}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {machineStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="installation_date">Installation Date</Label>
                <Input id="installation_date" type="date" value={machine.installation_date ? machine.installation_date.split('T')[0] : ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_service_date">Last Service Date</Label>
                <Input id="last_service_date" type="date" value={machine.last_service_date ? machine.last_service_date.split('T')[0] : ''} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={machine.notes || ''} onChange={handleInputChange} rows={4} />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}