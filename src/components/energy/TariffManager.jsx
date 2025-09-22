import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnergyTariff, Location } from '@/api/entities';
import { DollarSign, Plus, Edit, Trash2, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function TariffManager() {
  const [tariffs, setTariffs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTariff, setEditingTariff] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tariffData, locationData] = await Promise.all([
        EnergyTariff.list('-effective_date'),
        Location.list()
      ]);
      setTariffs(tariffData);
      setLocations(locationData);
    } catch (error) {
      console.error('Error loading tariff data:', error);
      toast.error('Failed to load energy tariffs');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTariff = async (tariffData) => {
    try {
      if (editingTariff) {
        await EnergyTariff.update(editingTariff.id, tariffData);
        toast.success('Energy tariff updated');
      } else {
        await EnergyTariff.create(tariffData);
        toast.success('Energy tariff created');
      }
      setShowForm(false);
      setEditingTariff(null);
      loadData();
    } catch (error) {
      toast.error('Failed to save energy tariff');
    }
  };

  const handleDeleteTariff = async (tariff) => {
    if (confirm(`Delete tariff "${tariff.tariff_name}"?`)) {
      try {
        await EnergyTariff.delete(tariff.id);
        toast.success('Energy tariff deleted');
        loadData();
      } catch (error) {
        toast.error('Failed to delete energy tariff');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading energy tariffs..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Energy Tariff Management</h2>
          <p className="text-slate-600">Configure energy pricing and billing structures</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tariff
        </Button>
      </div>

      {/* Tariffs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tariffs.map(tariff => {
          const location = locations.find(l => l.id === tariff.location_id);
          
          return (
            <Card key={tariff.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{tariff.tariff_name}</CardTitle>
                    <p className="text-sm text-slate-600">{location?.name || 'Unknown Location'}</p>
                  </div>
                  <Badge className={tariff.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {tariff.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Base Rate</span>
                  <span className="font-medium">{(tariff.base_rate_cents_per_kwh / 100).toFixed(3)}¢/kWh</span>
                </div>

                {/* Tariff Type */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Type</span>
                  <Badge variant="outline">{tariff.tariff_type.replace('_', ' ')}</Badge>
                </div>

                {/* Time of Use Rates */}
                {tariff.time_of_use_rates && tariff.time_of_use_rates.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Time of Use Rates:</span>
                    {tariff.time_of_use_rates.slice(0, 3).map((rate, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{rate.period_name}</span>
                        <span>{(rate.rate_cents_per_kwh / 100).toFixed(3)}¢/kWh</span>
                      </div>
                    ))}
                    {tariff.time_of_use_rates.length > 3 && (
                      <div className="text-xs text-slate-500">
                        +{tariff.time_of_use_rates.length - 3} more periods
                      </div>
                    )}
                  </div>
                )}

                {/* Demand Charges */}
                {tariff.demand_charges && tariff.demand_charges.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Demand Charges:</span>
                    {tariff.demand_charges.map((charge, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{charge.threshold_kw}kW+</span>
                        <span>{(charge.rate_cents_per_kw / 100).toFixed(2)}¢/kW</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Supply Charge */}
                {tariff.daily_supply_charge_cents > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Daily Supply</span>
                    <span className="font-medium">${(tariff.daily_supply_charge_cents / 100).toFixed(2)}</span>
                  </div>
                )}

                {/* Green Energy */}
                {tariff.green_energy_percentage > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Renewable %</span>
                    <span className="font-medium text-green-600">{tariff.green_energy_percentage}%</span>
                  </div>
                )}

                {/* Effective Period */}
                <div className="pt-2 border-t space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Effective From</span>
                    <span>{format(new Date(tariff.effective_date), 'MMM d, yyyy')}</span>
                  </div>
                  {tariff.expiry_date && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Expires</span>
                      <span>{format(new Date(tariff.expiry_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingTariff(tariff);
                      setShowForm(true);
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTariff(tariff)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {tariffs.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Energy Tariffs</h3>
              <p className="text-slate-600 mb-4">
                Set up energy tariffs to track costs and optimize consumption
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Tariff
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tariff Form Modal would go here */}
      {showForm && (
        <TariffFormModal
          tariff={editingTariff}
          locations={locations}
          onSave={handleSaveTariff}
          onCancel={() => {
            setShowForm(false);
            setEditingTariff(null);
          }}
        />
      )}
    </div>
  );
}

// Simplified tariff form modal
function TariffFormModal({ tariff, locations, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    location_id: tariff?.location_id || '',
    tariff_name: tariff?.tariff_name || '',
    provider: tariff?.provider || '',
    tariff_type: tariff?.tariff_type || 'flat_rate',
    base_rate_cents_per_kwh: tariff?.base_rate_cents_per_kwh || 2500, // 25c default
    daily_supply_charge_cents: tariff?.daily_supply_charge_cents || 0,
    green_energy_percentage: tariff?.green_energy_percentage || 0,
    effective_date: tariff?.effective_date || new Date().toISOString().split('T')[0],
    is_active: tariff?.is_active ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {tariff ? 'Edit Energy Tariff' : 'Add Energy Tariff'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tariff Name</label>
            <Input
              value={formData.tariff_name}
              onChange={(e) => setFormData({ ...formData, tariff_name: e.target.value })}
              placeholder="e.g., Commercial Peak/Off-Peak"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Select value={formData.location_id} onValueChange={(value) => setFormData({ ...formData, location_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <Input
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              placeholder="e.g., AGL, Origin Energy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Base Rate (cents per kWh)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.base_rate_cents_per_kwh / 100}
              onChange={(e) => setFormData({ ...formData, base_rate_cents_per_kwh: Math.round(parseFloat(e.target.value || 0) * 100) })}
              placeholder="25.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Daily Supply Charge ($)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.daily_supply_charge_cents / 100}
              onChange={(e) => setFormData({ ...formData, daily_supply_charge_cents: Math.round(parseFloat(e.target.value || 0) * 100) })}
              placeholder="1.20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Effective Date</label>
            <Input
              type="date"
              value={formData.effective_date}
              onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-sm font-medium">Active Tariff</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Tariff
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}