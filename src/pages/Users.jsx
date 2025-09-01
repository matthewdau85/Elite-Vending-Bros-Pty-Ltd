import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Shield,
  Settings,
  Trash2,
  AlertCircle
} from "lucide-react";
import EditUserDialog from "../components/users/EditUserDialog";
import DeleteUserDialog from "../components/users/DeleteUserDialog";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, meData] = await Promise.all([
        User.list(),
        User.me()
      ]);
      setUsers(usersData);
      setCurrentUser(meData);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setIsLoading(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowEditDialog(true);
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await User.update(userId, userData);
      setShowEditDialog(false);
      setEditingUser(null);
      loadData();
      alert("User details updated successfully.");
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response?.status === 403) {
        alert("Update failed (Error 403): You do not have permission to modify these user properties.");
      } else {
        alert(`Failed to update user: ${error.message}`);
      }
    }
  };
  
  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async (userId) => {
    try {
      const currentUser = await User.me();
      if (currentUser.id === userId) {
        alert("You cannot delete your own account from this page.");
        setShowDeleteDialog(false);
        setDeletingUser(null);
        return;
      }
      
      await User.delete(userId, { force: true });
      setShowDeleteDialog(false);
      setDeletingUser(null);
      loadData();
      alert("User has been successfully deleted.");
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response?.status === 422) {
          alert("User deletion is restricted by the platform.\n\nTo delete this user, please:\n1. Go to your main base44 platform dashboard\n2. Navigate to Data > Users\n3. Delete the user from there\n\nUser accounts cannot be deleted through individual applications for security reasons.");
      } else if (error.response?.status === 403) {
          alert("Deletion failed (Error 403): You do not have permission to delete this user. Please contact a super-administrator.");
      } else {
        alert(`Failed to delete user. Error: ${error.message}`);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const canManageUsers = currentUser && currentUser.role === 'admin';

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-1">
              Manage team members and their access permissions
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

        {!isLoading && !canManageUsers && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to manage users. Please contact an administrator.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredUsers.map((user) => {
              const isCurrentUserRow = currentUser && currentUser.id === user.id;
              const canPerformActions = canManageUsers && !isCurrentUserRow;
              
              let tooltip = "";
              if (!canManageUsers) tooltip = "Only admins can manage users.";
              else if (isCurrentUserRow) tooltip = "You cannot manage your own account here.";

              return (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <UsersIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{user.full_name}</h3>
                          <p className="text-slate-600 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                          <Shield className="w-3 h-3 mr-1" />
                          {user.role}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(user)}
                          disabled={!canPerformActions}
                          title={tooltip}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          disabled={!canPerformActions}
                          title={tooltip}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Users Found</h3>
              <p className="text-slate-500">Invite team members to get started</p>
            </CardContent>
          </Card>
        )}

        <EditUserDialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingUser(null);
          }}
          onSubmit={handleUpdateUser}
          user={editingUser}
        />

        <DeleteUserDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeletingUser(null);
          }}
          onConfirm={handleConfirmDelete}
          user={deletingUser}
        />
      </div>
    </div>
  );
}