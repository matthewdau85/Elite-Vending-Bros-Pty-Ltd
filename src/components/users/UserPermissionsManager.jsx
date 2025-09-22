
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Users, Settings } from "lucide-react";

export default function UserPermissionsManager({ user, onUpdate }) {
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState('viewer');

  useEffect(() => {
    if (user) {
      setPermissions(user.app_permissions || []);
      setRole(user.app_role || 'viewer');
    }
  }, [user]);

  const availablePermissions = [
    { id: 'dashboard_view', label: 'View Dashboard', category: 'Core' },
    { id: 'machines_manage', label: 'Manage Machines', category: 'Operations' },
    { id: 'inventory_manage', label: 'Manage Inventory', category: 'Operations' },
    { id: 'sales_view', label: 'View Sales Data', category: 'Analytics' },
    { id: 'finance_view', label: 'View Financial Reports', category: 'Analytics' },
    { id: 'routes_manage', label: 'Manage Routes', category: 'Operations' },
    { id: 'ai_insights', label: 'Access AI Insights', category: 'Advanced' },
    { id: 'system_admin', label: 'System Administration', category: 'Admin' }
  ];

  const handleSave = async () => {
    if (!user) return; // Guard against null user
    await User.update(user.id, {
      app_role: role,
      app_permissions: permissions
    });
    onUpdate();
  };

  if (!user) {
    return null; // Don't render anything if the user object is not available yet
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          User Permissions - {user.full_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium">Role</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="viewer">Viewer</option>
            <option value="operator">Operator</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Specific Permissions</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePermissions.map(permission => (
              <div key={permission.id} className="flex items-center space-x-2">
                <Checkbox 
                  checked={permissions.includes(permission.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPermissions([...permissions, permission.id]);
                    } else {
                      setPermissions(permissions.filter(p => p !== permission.id));
                    }
                  }}
                />
                <div>
                  <label className="text-sm font-medium">{permission.label}</label>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {permission.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Permissions
        </Button>
      </CardContent>
    </Card>
  );
}
