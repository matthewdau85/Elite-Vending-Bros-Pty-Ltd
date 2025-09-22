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
import { User } from '@/api/entities';
import { toast } from 'sonner';
import { ROLES } from '../shared/roles';
import { trackGA4Event } from '../utils/analytics';

export default function EditUserDialog({ isOpen, onClose, user }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    app_role: 'viewer',
  });
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
        app_role: user.app_role || 'viewer',
      });
    } else {
      setFormData({ fullName: '', email: '', app_role: 'viewer' });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, app_role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditMode) {
        // Update existing user
        await User.update(user.id, {
          full_name: formData.fullName,
          app_role: formData.app_role,
        });
        toast.success(`User ${formData.fullName} updated successfully.`);
        trackGA4Event('user_updated', { role: formData.app_role });
      } else {
        // Invite new user
        await User.invite(formData.email, formData.app_role, {
          full_name: formData.fullName,
        });
        toast.success(`Invitation sent to ${formData.email}.`);
        trackGA4Event('user_invited', { role: formData.app_role });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'invite'} user.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Invite New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the user\'s details below.' : 'Enter the new user\'s details to send an invitation.'}
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