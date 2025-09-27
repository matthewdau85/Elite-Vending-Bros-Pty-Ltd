import React, { useState, useEffect } from 'react';
import { AiConversation } from '@/api/entities';
import { aiRestoreConversation } from '@/api/functions';
import { aiPurgeConversation } from '@/api/functions';
import { PageSkeleton } from '../components/shared/Skeletons';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import { Link } from 'react-router-dom';

export default function AiTrashPage() {
  const [trashed, setTrashed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedConvo, setSelectedConvo] = useState(null);

  const loadTrashedConversations = async () => {
    setIsLoading(true);
    try {
      const convos = await AiConversation.filter({ 'deleted_at-ne': null }, '-deleted_at');
      setTrashed(convos);
    } catch (error) {
      toast.error('Failed to load trashed conversations.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrashedConversations();
  }, []);

  const handleRestore = async (conversationId) => {
    try {
      await aiRestoreConversation({ conversationId });
      toast.success('Conversation restored.');
      loadTrashedConversations();
    } catch (error) {
      toast.error(`Failed to restore: ${error.message}`);
    }
  };

  const handlePurgeClick = (conversation) => {
    setSelectedConvo(conversation);
    setDialogOpen(true);
  };
  
  const handleConfirmPurge = async () => {
    if (!selectedConvo) return;
    try {
      await aiPurgeConversation({ conversationId: selectedConvo.id });
      toast.success('Conversation permanently deleted.');
      loadTrashedConversations();
    } catch (error) {
      toast.error(`Failed to purge: ${error.message}`);
    } finally {
      setDialogOpen(false);
      setSelectedConvo(null);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-6 h-6" />
            Conversation Trash
          </CardTitle>
          <CardDescription>
            Items in the trash will be permanently deleted after their retention period ends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trashed.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>The trash is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trashed.map(convo => (
                <Card key={convo.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{convo.title}</h4>
                    <p className="text-sm text-slate-500">
                      Deleted {formatDistanceToNow(new Date(convo.deleted_at), { addSuffix: true })}
                    </p>
                    {convo.purge_at && (
                       <p className="text-xs text-red-600 mt-1">
                         Purges on {format(new Date(convo.purge_at), 'MMM d, yyyy')}
                       </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleRestore(convo.id)}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handlePurgeClick(convo)}>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Delete Forever
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmPurge}
        title="Permanently Delete Conversation?"
        description="This action cannot be undone. All messages and data associated with this conversation will be permanently removed."
        confirmText="Yes, Delete Forever"
        icon={<AlertTriangle className="text-destructive" />}
      />
    </div>
  );
}