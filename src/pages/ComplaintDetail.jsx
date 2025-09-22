
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Complaint } from '@/api/entities';
import { Machine } from '@/api/entities';
import { Location } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { safeArray, safeString } from '../components/shared/SearchUtils';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [machine, setMachine] = useState(null);
  const [location, setLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadComplaint = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        const complaintData = await Complaint.get(id);
        setComplaint(complaintData);
        setResolutionNote(complaintData.resolution_note || '');

        if (complaintData.machine_id) {
          const machineData = await Machine.get(complaintData.machine_id);
          setMachine(machineData);
          if (machineData.location_id) {
            const locationData = await Location.get(machineData.location_id);
            setLocation(locationData);
          }
        }
      } catch (error) {
        console.error("Failed to load complaint details", error);
        toast.error("Failed to load complaint details.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      loadComplaint();
    }
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      const updatePayload = {
        status: newStatus,
        resolution_note: resolutionNote,
        resolved_by: currentUser.email,
        resolved_at: new Date().toISOString()
      };
      const updatedComplaint = await Complaint.update(id, updatePayload);
      setComplaint(updatedComplaint);
      toast.success(`Complaint status updated to ${newStatus}.`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading complaint details...</div>;
  }

  if (!complaint) {
    return <div className="p-8">Complaint not found.</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
            <CardDescription>
              Logged on {format(new Date(complaint.created_at), 'dd MMM yyyy, h:mm a')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <p><strong>Name:</strong> {safeString(complaint.customer_name)}</p>
              <p><strong>Contact:</strong> {safeString(complaint.customer_contact)}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Issue Details</h3>
              <p><strong>Machine:</strong> {safeString(machine?.machine_id)}</p>
              <p><strong>Location:</strong> {safeString(location?.name)}</p>
              <p><strong>Issue Type:</strong> <Badge>{complaint.issue_type}</Badge></p>
              <p><strong>Amount Claimed:</strong> ${((complaint.amount_claimed_cents || 0) / 100).toFixed(2)}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="p-3 bg-slate-100 rounded-md">{complaint.description}</p>
            </div>
            {safeArray(complaint.evidence_urls).length > 0 && (
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Evidence</h3>
                <div className="flex gap-2">
                  {complaint.evidence_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Evidence ${i+1}`} className="w-24 h-24 object-cover rounded-md border" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resolution_note">Resolution Note</Label>
              <Textarea
                id="resolution_note"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Add notes about the investigation and resolution..."
                rows={4}
              />
            </div>
            <div className="flex items-center gap-4">
              <p className="font-medium">Update Status:</p>
              <Select onValueChange={handleStatusUpdate} defaultValue={complaint.status}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {isUpdating && <p className="text-sm text-slate-500">Updating...</p>}
            </div>
            {complaint.status !== 'open' && (
              <div className="text-sm text-slate-600 border-t pt-4 mt-4">
                <p><strong>Last Status:</strong> <Badge variant="secondary">{complaint.status}</Badge></p>
                {complaint.resolved_by && <p><strong>Updated by:</strong> {complaint.resolved_by}</p>}
                {complaint.resolved_at && <p><strong>Updated at:</strong> {format(new Date(complaint.resolved_at), 'dd MMM yyyy, h:mm a')}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
