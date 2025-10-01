import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Machine, Location } from '@/api/entities';
import { PageSkeleton } from '@/components/shared/Skeletons';
import EmptyState from '@/components/shared/EmptyState';
import PageHeader from '@/components/shared/PageHeader';
import AddMachineDialog from '@/components/machines/AddMachineDialog';
import MachineList from '@/components/machines/MachineList';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Coffee } from 'lucide-react';
import { useDebounce } from '@/components/shared/useDebounce'; // Assuming this hook exists or can be created
import { withTenantFilters, TenantAccessError } from '@/lib/tenantContext';

// If useDebounce doesn't exist, here's a simple implementation.
// To be clean, this should be in components/shared/useDebounce.js
/*
import { useState, useEffect } from 'react';
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
*/

export default function MachinesPage() {
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [machineData, locationData] = await Promise.all([
        Machine.list('-created_date', { filter: withTenantFilters() }),
        Location.list({ filter: withTenantFilters() }),
      ]);

      const locationMap = new Map(locationData.map(loc => [loc.id, loc.name]));
      const machinesWithLocation = machineData.map(m => ({
        ...m,
        location_name: locationMap.get(m.location_id) || 'N/A',
      }));

      setMachines(machinesWithLocation);
      setLocations(locationData);
    } catch (e) {
      if (e instanceof TenantAccessError) {
        setError('You are not authorized to view machines for this tenant.');
      } else {
        setError('Failed to load machines. Please try again.');
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMachines = useMemo(() => {
    return machines.filter(machine => {
      const searchMatch = debouncedSearchTerm
        ? machine.machine_id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (machine.location_name && machine.location_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        : true;
      const statusMatch =
        statusFilter === 'all' ? true : machine.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [machines, debouncedSearchTerm, statusFilter]);

  const handleMachineAdded = useCallback(() => {
    setIsDialogOpen(false);
    fetchData(); // Re-fetch all data to get the new machine
  }, []);

  const handleMachineClick = useCallback((machineId) => {
    // Navigate to machine detail page
    window.location.href = `/machinedetail?id=${machineId}`;
  }, []);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Machine Fleet"
        subtitle="Manage and monitor all your vending machines."
        buttonText="Add Machine"
        onButtonClick={() => setIsDialogOpen(true)}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by Machine ID or Location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {machines.length === 0 ? (
        <EmptyState
          icon={Coffee}
          title="No machines yet"
          description="Get started by adding your first vending machine to the fleet."
          ctaText="Add First Machine"
          onCtaClick={() => setIsDialogOpen(true)}
          helpArticleSlug="add-first-machine"
        />
      ) : (
        <MachineList machines={filteredMachines} onMachineClick={handleMachineClick} />
      )}

      <AddMachineDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onMachineAdded={handleMachineAdded}
        locations={locations}
      />
    </div>
  );
}