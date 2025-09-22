
import React, { useState, useEffect } from 'react';
import { Complaint, Machine, Location } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquareWarning } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils'; 

import NewComplaintDialog from '@/components/complaints/NewComplaintDialog';
import ComplaintTable from '@/components/complaints/ComplaintTable';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PageHeader from '@/components/shared/PageHeader';
import ComplaintCreateDrawer from '../components/complaints/ComplaintCreateDrawer';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Renamed state variable for dialog visibility
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);

  const navigate = useNavigate(); // Initialize navigate hook

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const [complaintsData, machinesData, locationsData] = await Promise.all([
        Complaint.list('-created_date', 100),
        Machine.list(),
        Location.list(),
      ]);
      setComplaints(complaintsData || []);
      setMachines(machinesData || []);
      setLocations(locationsData || []);
    } catch (error) {
      console.error("Failed to load complaints data:", error);
      toast.error("Could not load complaints data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints(); // Call the renamed function
  }, []);

  const handleComplaintAdded = (newComplaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader
            title="Customer Complaints"
            description="Track, manage, and resolve customer issues."
            actions={
              <div className="flex gap-2">
                <Button onClick={() => setIsNewComplaintOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Log New Complaint
                </Button>
                <Button variant="secondary" onClick={() => navigate('/report')}>
                  <MessageSquareWarning className="w-4 h-4 mr-2" />
                  Open Online Form
                </Button>
              </div>
            }
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          // Updated ComplaintTable props and added onRowClick for navigation
          <ComplaintTable
            complaints={complaints}
            onRowClick={(c) => navigate(createPageUrl(`ComplaintDetail?id=${c.id}`))}
          />
        )}

        <ComplaintCreateDrawer
          open={isNewComplaintOpen}
          setOpen={setIsNewComplaintOpen}
          onComplaintAdded={handleComplaintAdded}
        />
      </div>
    </div>
  );
}
