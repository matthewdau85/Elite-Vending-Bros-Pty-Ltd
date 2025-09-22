
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from 'sonner';
import { Machine, Sale, Alert, MachineStock, Location } from '@/api/entities';
import { PageSkeleton } from '../components/shared/Skeletons';
import PageHeader from '../components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TicketCreateDrawer from '../components/service/TicketCreateDrawer';

export default function MachineDetail() {
  const [machine, setMachine] = useState(null);
  const [location, setLocation] = useState(null); // Added for location entity
  const [sales, setSales] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTicketDrawerOpen, setIsTicketDrawerOpen] = useState(false); // Added for ticket drawer

  const locationUrl = useLocation(); // Renamed to avoid conflict with state variable
  const machineId = locationUrl.pathname.split('/').pop();

  const loadMachineData = useCallback(async () => {
    if (!machineId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const machineData = await Machine.get(machineId); // Fetch machine first
      setMachine(machineData);

      if (machineData) {
        const [salesData, alertsData, stockData, locationData] = await Promise.all([
          Sale.filter({ machine_id: machineId }, "-sale_datetime", 50),
          Alert.filter({ machine_id: machineId }, "-alert_datetime", 20),
          MachineStock.filter({ machine_id: machineId }),
          Location.get(machineData.location_id) // Fetch location based on machineData
        ]);
        setSales(salesData);
        setAlerts(alertsData);
        setStock(stockData);
        setLocation(locationData); // Set new location state
      }
    } catch (error) {
      console.error("Failed to load machine details:", error);
      toast.error("Could not load machine details.");
      setMachine(null); // Ensure machine is null on error to show "not found" or similar
    } finally {
      setLoading(false);
    }
  }, [machineId]);

  useEffect(() => {
    loadMachineData();
  }, [loadMachineData]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (!machine) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">Machine not found or failed to load.</p>
      </div>
    );
  }

  const breadcrumbs = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/machines', label: 'Machines' },
    { href: `/machines/${machine.id}`, label: machine.machine_id }, // Changed to machine.machine_id for consistency
  ];

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title={machine.machine_id || 'Unknown Machine'} // Changed to machine.machine_id
        description={`Model: ${machine.model} | Location: ${location?.name || 'N/A'}`}
        breadcrumbs={breadcrumbs}
        actions={
          <Button onClick={() => setIsTicketDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Ticket for this Machine
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Details</h2>
          <p><strong>ID:</strong> {machine.id}</p>
          <p><strong>Location:</strong> {machine.location || 'N/A'}</p>
          <p><strong>Status:</strong> {machine.status || 'N/A'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Connectivity</h2>
          <p><strong>Last Online:</strong> {machine.last_online ? new Date(machine.last_online).toLocaleString() : 'N/A'}</p>
          <p><strong>Firmware Version:</strong> {machine.firmware_version || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Sales</h2>
        {sales.length > 0 ? (
          <ul className="space-y-2">
            {sales.map(sale => (
              <li key={sale.id} className="border-b pb-2 last:border-b-0">
                <p><strong>Item:</strong> {sale.item_name} - <strong>Amount:</strong> ${sale.amount?.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{new Date(sale.sale_datetime).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No recent sales data available for this machine.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Active Alerts</h2>
        {alerts.length > 0 ? (
          <ul className="space-y-2">
            {alerts.map(alert => (
              <li key={alert.id} className="border-b pb-2 last:border-b-0">
                <p><strong>Type:</strong> {alert.type} - <strong>Message:</strong> {alert.message}</p>
                <p className="text-sm text-gray-500">{new Date(alert.alert_datetime).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No active alerts for this machine.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Current Stock</h2>
        {stock.length > 0 ? (
          <ul className="space-y-2">
            {stock.map(item => (
              <li key={item.id} className="border-b pb-2 last:border-b-0">
                <p><strong>Product:</strong> {item.product_name} - <strong>Quantity:</strong> {item.quantity}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No stock data available for this machine.</p>
        )}
      </div>
      
      <TicketCreateDrawer 
        open={isTicketDrawerOpen} 
        setOpen={setIsTicketDrawerOpen} 
        machineId={machine.id}
      />
    </div>
  );
}
