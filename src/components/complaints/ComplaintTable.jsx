import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ComplaintTable({ complaints, machines, locations, isLoading }) {
  if (isLoading) {
    return <div className="text-center p-8">Loading complaints...</div>;
  }

  if (complaints.length === 0) {
    return <div className="text-center p-8 text-slate-500">No complaints match your criteria.</div>;
  }

  const getMachineName = (machineId) => machines.find(m => m.id === machineId)?.machine_id || 'N/A';
  const getLocationName = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return locations.find(l => l.id === machine?.location_id)?.name || 'N/A';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Machine</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Issue</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {complaints.map(complaint => (
          <TableRow key={complaint.id}>
            <TableCell>{format(new Date(complaint.created_at), 'dd MMM yyyy')}</TableCell>
            <TableCell>{complaint.customer_name || complaint.customer_contact}</TableCell>
            <TableCell>{getMachineName(complaint.machine_id)}</TableCell>
            <TableCell>{getLocationName(complaint.machine_id)}</TableCell>
            <TableCell><Badge variant="outline">{complaint.issue_type}</Badge></TableCell>
            <TableCell>${((complaint.amount_claimed_cents || 0) / 100).toFixed(2)}</TableCell>
            <TableCell>
              <Link to={createPageUrl(`ComplaintDetail?id=${complaint.id}`)}>
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}