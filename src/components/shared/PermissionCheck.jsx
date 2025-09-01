import React from "react";
import { useState, useEffect } from "react";
import { User, RolePermission } from "@/api/entities";

// Permission checking hook
export function usePermissions() {
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState("viewer");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const user = await User.me();
        const rolePermissions = await RolePermission.filter({ user_email: user.email });
        
        if (rolePermissions.length > 0) {
          setPermissions(rolePermissions[0].permissions || []);
          setRole(rolePermissions[0].role || "viewer");
        } else {
          // Default permissions based on user role
          const defaultPerms = getDefaultPermissions(user.role);
          setPermissions(defaultPerms);
          setRole(user.role || "viewer");
        }
      } catch (error) {
        console.error("Error loading permissions:", error);
        setPermissions([]);
        setRole("viewer");
      }
      setIsLoading(false);
    };
    
    loadPermissions();
  }, []);

  const hasPermission = (permission) => {
    return permissions.includes(permission) || role === "super_admin";
  };

  return { permissions, role, hasPermission, isLoading };
}

// Get default permissions based on role
function getDefaultPermissions(role) {
  const permissionSets = {
    admin: [
      "view_dashboard", "view_machines", "edit_machines", "view_inventory", 
      "edit_inventory", "view_sales", "view_finance", "edit_finance", 
      "view_alerts", "manage_alerts", "view_routes", "edit_routes", 
      "view_users", "admin_settings", "view_ai_insights", "generate_reports", 
      "manage_locations"
    ],
    manager: [
      "view_dashboard", "view_machines", "edit_machines", "view_inventory",
      "edit_inventory", "view_sales", "view_finance", "view_alerts", 
      "manage_alerts", "view_routes", "edit_routes", "complete_routes",
      "view_ai_insights", "generate_reports"
    ],
    operator: [
      "view_dashboard", "view_machines", "view_inventory", "view_sales",
      "view_alerts", "view_routes", "complete_routes", "collect_cash", 
      "perform_maintenance"
    ],
    viewer: [
      "view_dashboard", "view_machines", "view_inventory", "view_sales", 
      "view_alerts", "view_routes"
    ]
  };
  
  return permissionSets[role] || permissionSets.viewer;
}

// Permission wrapper component
export function PermissionWrapper({ permission, children, fallback = null }) {
  const { hasPermission, isLoading } = usePermissions();
  
  if (isLoading) return null;
  
  if (!hasPermission(permission)) {
    return fallback;
  }
  
  return children;
}

// Higher-order component for page-level permission checking
export function withPermission(Component, requiredPermission) {
  return function ProtectedComponent(props) {
    const { hasPermission, isLoading } = usePermissions();
    
    if (isLoading) {
      return <div className="p-8 text-center">Loading...</div>;
    }
    
    if (!hasPermission(requiredPermission)) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to view this page.</p>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}