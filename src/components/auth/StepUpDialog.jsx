import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, AlertTriangle } from 'lucide-react';
import { reauthStart } from '@/api/functions';
import { toast } from 'sonner';

export default function StepUpDialog({ open, onOpenChange, onSuccess, title = "Enhanced Security Required" }) {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await reauthStart({ password });
      
      if (response.data?.success) {
        toast.success('Authentication verified');
        onSuccess(response.data.step_up_token);
        onOpenChange(false);
        setPassword('');
      } else {
        throw new Error(response.data?.error || 'Authentication failed');
      }
    } catch (error) {
      setError(error.message);
      toast.error('Authentication failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            This action requires additional authentication. Please verify your identity to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Current Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isVerifying}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isVerifying || !password.trim()}
            >
              {isVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify Identity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}