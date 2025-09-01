
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Route, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Truck, 
  User as UserIcon, 
  MapPin, 
  Calendar,
  MoreVertical
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { format } from "date-fns";
import AddRouteDialog from "../components/routes/AddRouteDialog";

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [routesData, usersData] = await Promise.all([
        Route.list("-updated_date"),
        User.list(),
      ]);
      setRoutes(routesData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading routes data:", error);
    }
    setIsLoading(false);
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setShowAddDialog(true);
  };

  const handleFormSubmit = async (routeData) => {
    if (editingRoute) {
      await Route.update(editingRoute.id, routeData);
    } else {
      await Route.create(routeData);
    }
    setShowAddDialog(false);
    setEditingRoute(null);
    loadData();
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Route Management</h1>
            <p className="text-slate-600 mt-1">
              Plan, assign, and track restocking and maintenance routes.
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingRoute(null);
              setShowAddDialog(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Route
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        ) : routes.length === 0 ? (
          <Card className="text-center py-12 border-0 shadow-md">
            <CardContent>
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Routes Created Yet</h3>
              <p className="text-slate-500 mb-6">
                Create your first route to start planning your machine visits.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Route
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route, index) => {
              const operator = users.find(u => u.email === route.assigned_operator);
              return (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-bold text-slate-900">{route.name}</CardTitle>
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEdit(route)}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-500">{route.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                      <div className="flex items-center gap-3 text-sm">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{operator?.full_name || "Unassigned"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{route.machine_ids?.length || 0} Machines</span>
                      </div>
                      {route.next_scheduled && (
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            Next run: {format(new Date(route.next_scheduled), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <div className="p-4 border-t mt-auto">
                      {route.id ? (
                        <Link to={createPageUrl(`RouteDetail?id=${route.id}`)}>
                          <Button className="w-full">View Route Details</Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full">Route ID Missing</Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      <AddRouteDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingRoute(null);
        }}
        onSubmit={handleFormSubmit}
        route={editingRoute}
      />
    </div>
  );
}
