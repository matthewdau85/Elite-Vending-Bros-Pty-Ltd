
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Users as UsersIcon, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import EditUserDialog from '../components/users/EditUserDialog';
import DeleteUserDialog from '../components/users/DeleteUserDialog';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { getRoleColor } from '../components/shared/roles.js';
import { trackGA4Event } from '../components/utils/analytics.js';
import RequireRole from '../components/auth/RequireRole';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await User.list('-created_date');
      setUsers(usersData || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Could not load users.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUserClick = () => {
    setSelectedUser(null);
    setIsEditDialogOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDialogClose = () => {
      setIsEditDialogOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <RequireRole requiredRole="admin">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <UsersIcon className="w-8 h-8 text-slate-500" />
                User Management
              </h1>
              <p className="text-slate-600 mt-2">
                Manage user accounts, roles, and permissions for your organization.
              </p>
            </div>
            <Button onClick={handleNewUserClick} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 ml-auto"></div></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-900">{user.full_name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${getRoleColor(user.app_role)} border-current`}>
                            {user.app_role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Viewer'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.created_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit User</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(user)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {users.length === 0 && !isLoading && (
                  <div className="text-center p-8 text-slate-500">
                    No users found.
                  </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isEditDialogOpen && (
          <EditUserDialog
            isOpen={isEditDialogOpen}
            onClose={handleDialogClose}
            user={selectedUser}
          />
        )}
        
        {isDeleteDialogOpen && (
          <DeleteUserDialog
            isOpen={isDeleteDialogOpen}
            onClose={handleDialogClose}
            user={selectedUser}
          />
        )}
      </div>
    </RequireRole>
  );
}
