import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Location, Route } from '@/api/entities';
import { toast } from 'sonner';
import { ROLES } from '../shared/roles';
import { trackGA4Event } from '../utils/analytics';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const RISKY_CAPABILITIES = [
  { id: 'can_edit_prices', label: 'Publish price changes' },
  { id: 'inventory.bulk_close', label: 'Bulk closes' },
];

const emptyFormState = {
  fullName: '',
  email: '',
  app_role: 'viewer',
  tenantScope: false,
  siteScopes: [],
  routeScopes: [],
  elevationScheduleEnabled: false,
  elevationStart: '',
  elevationEnd: '',
  elevationDuration: 15,
  twoFactorPermissions: [],
};

export default function EditUserDialog({ isOpen, onClose, user }) {
  const [formData, setFormData] = useState(() => ({ ...emptyFormState }));
  const [isSaving, setIsSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoadingScopes, setIsLoadingScopes] = useState(false);

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      const scopes = user?.security_profile?.scopes || user?.permission_claims?.scopes || {};
      const elevationPolicy = user?.security_profile?.elevation_policy || user?.permission_claims?.elevation || {};
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
        app_role: user.app_role || 'viewer',
        tenantScope: scopes?.tenant?.includes?.('*') || scopes?.tenant?.includes?.('all') || false,
        siteScopes: scopes?.sites || [],
        routeScopes: scopes?.routes || [],
        elevationScheduleEnabled: Array.isArray(elevationPolicy?.schedule) && elevationPolicy.schedule.length > 0,
        elevationStart: elevationPolicy?.schedule?.[0]?.start || elevationPolicy?.schedule?.[0]?.from || '',
        elevationEnd: elevationPolicy?.schedule?.[0]?.end || elevationPolicy?.schedule?.[0]?.to || '',
        elevationDuration: elevationPolicy?.default_duration_minutes || elevationPolicy?.duration_minutes || 15,
        twoFactorPermissions: user?.security_profile?.two_factor_required_for || user?.permission_claims?.two_factor_required_for || [],
      });
    } else {
      setFormData({ ...emptyFormState });
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;

    const loadScopes = async () => {
      setIsLoadingScopes(true);
      try {
        const [locationData, routeData] = await Promise.all([
          Location.list?.('-name') || Location.list?.() || [],
          Route.list?.('-created_date') || Route.list?.() || [],
        ]);
        setLocations(locationData || []);
        setRoutes(routeData || []);
      } catch (error) {
        console.error('Failed to load scope metadata', error);
        toast.error('Failed to load scope metadata');
      } finally {
        setIsLoadingScopes(false);
      }
    };

    loadScopes();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, app_role: value }));
  };

  const toggleSiteScope = (id) => {
    setFormData(prev => {
      const isSelected = prev.siteScopes.includes(id);
      const siteScopes = isSelected
        ? prev.siteScopes.filter(scopeId => scopeId !== id)
        : [...prev.siteScopes, id];
      return { ...prev, siteScopes };
    });
  };

  const toggleRouteScope = (id) => {
    setFormData(prev => {
      const isSelected = prev.routeScopes.includes(id);
      const routeScopes = isSelected
        ? prev.routeScopes.filter(scopeId => scopeId !== id)
        : [...prev.routeScopes, id];
      return { ...prev, routeScopes };
    });
  };

  const toggleTwoFactorPermission = (permission) => {
    setFormData(prev => {
      const isSelected = prev.twoFactorPermissions.includes(permission);
      const twoFactorPermissions = isSelected
        ? prev.twoFactorPermissions.filter(item => item !== permission)
        : [...prev.twoFactorPermissions, permission];
      return { ...prev, twoFactorPermissions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const securityProfile = {
        scopes: {
          tenant: formData.tenantScope ? ['*'] : [],
          sites: formData.siteScopes,
          routes: formData.routeScopes,
        },
        elevation_policy: {
          default_duration_minutes: Number(formData.elevationDuration) || 15,
          schedule:
            formData.elevationScheduleEnabled && formData.elevationStart && formData.elevationEnd
              ? [
                  {
                    start: new Date(formData.elevationStart).toISOString(),
                    end: new Date(formData.elevationEnd).toISOString(),
                  },
                ]
              : [],
        },
        two_factor_required_for: formData.twoFactorPermissions,
      };

      if (isEditMode) {
        await User.update(user.id, {
          full_name: formData.fullName,
          app_role: formData.app_role,
          security_profile: securityProfile,
        });
        toast.success(`User ${formData.fullName} updated successfully.`);
        trackGA4Event('user_updated', { role: formData.app_role });
      } else {
        await User.invite(formData.email, formData.app_role, {
          full_name: formData.fullName,
          security_profile: securityProfile,
        });
        toast.success(`Invitation sent to ${formData.email}.`);
        trackGA4Event('user_invited', { role: formData.app_role });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'invite'} user.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Invite New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the user's details below." : "Enter the new user's details to send an invitation."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g., Jane Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., jane.doe@example.com"
              required
              disabled={isEditMode}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app_role">Role</Label>
            <Select
              value={formData.app_role}
              onValueChange={handleRoleChange}
              required
            >
              <SelectTrigger id="app_role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tenant Access</Label>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium text-sm">Full tenant access</p>
                <p className="text-xs text-slate-500">Grants visibility to all sites and routes.</p>
              </div>
              <Switch
                checked={formData.tenantScope}
                onCheckedChange={(value) => setFormData(prev => ({ ...prev, tenantScope: value }))}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site Scopes</Label>
              <ScrollArea className="h-40 border rounded-lg p-3">
                {isLoadingScopes ? (
                  <p className="text-sm text-slate-500">Loading sites…</p>
                ) : (
                  <div className="space-y-2">
                    {locations.map(location => (
                      <label key={location.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={formData.siteScopes.includes(location.id)}
                          onCheckedChange={() => toggleSiteScope(location.id)}
                        />
                        <span>{location.name}</span>
                      </label>
                    ))}
                    {locations.length === 0 && (
                      <p className="text-sm text-slate-500">No locations available.</p>
                    )}
                  </div>
                )}
              </ScrollArea>
              <p className="text-xs text-slate-500">Assign site-level access for regional roles.</p>
            </div>

            <div className="space-y-2">
              <Label>Route Scopes</Label>
              <ScrollArea className="h-40 border rounded-lg p-3">
                {isLoadingScopes ? (
                  <p className="text-sm text-slate-500">Loading routes…</p>
                ) : (
                  <div className="space-y-2">
                    {routes.map(route => (
                      <label key={route.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={formData.routeScopes.includes(route.id)}
                          onCheckedChange={() => toggleRouteScope(route.id)}
                        />
                        <span>{route.name}</span>
                      </label>
                    ))}
                    {routes.length === 0 && (
                      <p className="text-sm text-slate-500">No routes available.</p>
                    )}
                  </div>
                )}
              </ScrollArea>
              <p className="text-xs text-slate-500">Limit operations to specific delivery routes.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Elevation Policy</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="elevationDuration" className="text-xs uppercase tracking-wide text-slate-500">Default Duration (minutes)</Label>
                <Input
                  id="elevationDuration"
                  type="number"
                  min="5"
                  max="180"
                  name="elevationDuration"
                  value={formData.elevationDuration}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-slate-500">Schedule window</Label>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">Require scheduled elevation</p>
                    <p className="text-xs text-slate-500">Restrict elevated access to defined time windows.</p>
                  </div>
                  <Switch
                    checked={formData.elevationScheduleEnabled}
                    onCheckedChange={(value) => setFormData(prev => ({ ...prev, elevationScheduleEnabled: value }))}
                  />
                </div>
              </div>
            </div>
            {formData.elevationScheduleEnabled && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="elevationStart">Start</Label>
                  <Input
                    id="elevationStart"
                    type="datetime-local"
                    value={formData.elevationStart}
                    onChange={(e) => setFormData(prev => ({ ...prev, elevationStart: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="elevationEnd">End</Label>
                  <Input
                    id="elevationEnd"
                    type="datetime-local"
                    value={formData.elevationEnd}
                    onChange={(e) => setFormData(prev => ({ ...prev, elevationEnd: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Risky Capabilities (Require 2FA)</Label>
            <div className="space-y-2 rounded-lg border p-3">
              {RISKY_CAPABILITIES.map(capability => (
                <label key={capability.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={formData.twoFactorPermissions.includes(capability.id)}
                    onCheckedChange={() => toggleTwoFactorPermission(capability.id)}
                  />
                  <span>{capability.label}</span>
                  {formData.twoFactorPermissions.includes(capability.id) && (
                    <Badge variant="outline" className="ml-auto text-xs text-emerald-700 border-emerald-200">2FA enforced</Badge>
                  )}
                </label>
              ))}
              {formData.twoFactorPermissions.length === 0 && (
                <p className="text-xs text-slate-500">No additional 2FA requirements applied.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Send Invitation')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
