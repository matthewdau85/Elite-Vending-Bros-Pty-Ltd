
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Zap, CheckCircle, AlertCircle, XCircle, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { XeroConnection } from '@/api/entities';
import { startXeroConnection } from '@/api/functions';
import { syncToXero } from '@/api/functions';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';

export default function AccountingSync() {
    const [connection, setConnection] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [confirmSyncOpen, setConfirmSyncOpen] = useState(false); // New state for confirmation dialog

    useEffect(() => {
        const checkConnection = async () => {
            setIsLoading(true);
            try {
                const connections = await XeroConnection.list('', 1);
                if (connections.length > 0) {
                    setConnection(connections[0]);
                } else {
                    setConnection(null);
                }
            } catch (error) {
                toast.error("Failed to check Xero connection status.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        checkConnection();
    }, []);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            console.log("Starting Xero connection..."); // Debug log
            const response = await startXeroConnection({});
            console.log("Response:", response); // Debug log
            
            if (response.data && response.data.authUrl) {
                sessionStorage.setItem('xero_oauth_state', response.data.state);
                window.location.href = response.data.authUrl;
            } else {
                throw new Error(response.data?.error || "Could not get Xero authorization URL.");
            }
        } catch (error) {
            console.error("Xero connection error:", error);
            toast.error(`Failed to start connection: ${error.message}`);
            setIsLoading(false);
        }
    };
    
    const handleDisconnect = async () => {
        if (window.confirm("Are you sure you want to disconnect from Xero?")) {
            setIsLoading(true);
            try {
                await XeroConnection.delete(connection.id);
                setConnection(null);
                toast.success("Disconnected from Xero.");
            } catch (error) {
                toast.error("Failed to disconnect.");
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleSyncAll = async () => { // Renamed from handleSync
        setConfirmSyncOpen(false); // Close the dialog immediately
        setIsSyncing(true);
        toast.info("Starting sync with Xero...");
        try {
            const response = await syncToXero({});
            if (response.data.success) {
                toast.success("Sync completed successfully!");
                // Refresh connection data to get updated last_sync_date and status
                const connections = await XeroConnection.list('', 1);
                if (connections.length > 0) {
                    setConnection(connections[0]);
                } else {
                    setConnection(null);
                }
            } else {
                throw new Error(response.data.error || "Sync failed.");
            }
        } catch (error) {
            toast.error(`Sync failed: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm("Are you sure you want to delete all sync history? This action cannot be undone.")) {
            setIsClearing(true);
            try {
                await XeroConnection.update(connection.id, { sync_history: [] });
                
                // Refresh data to show the empty history
                const connections = await XeroConnection.list('', 1);
                if (connections.length > 0) {
                    setConnection(connections[0]);
                }
                toast.success("Sync history cleared successfully.");
            } catch (error) {
                toast.error("Failed to clear sync history.");
                console.error(error);
            } finally {
                setIsClearing(false);
            }
        }
    };

    if (isLoading) {
        return (
          <Card>
            <CardHeader><CardTitle>Accounting Integration</CardTitle></CardHeader>
            <CardContent><div className="h-24 bg-slate-200 animate-pulse rounded-md" /></CardContent>
          </Card>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Accounting Connection</CardTitle>
                    <CardDescription>Manage your connection with Xero accounting software.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="p-8 border-2 border-dashed rounded-lg">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Activity className="h-8 w-8 text-blue-600" />
                            <span className="text-lg font-semibold text-slate-700">Xero</span>
                        </div>
                        
                        {connection ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                                    <CheckCircle className="w-5 h-5"/>
                                    <p>Connected to {connection.tenant_name}</p>
                                </div>
                                {connection.last_sync_date && (
                                    <p className="text-sm text-slate-500">
                                        Last sync: {format(new Date(connection.last_sync_date), "MMM d, yyyy h:mm a")}
                                        <span className={`ml-2 font-semibold ${connection.last_sync_status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                          ({connection.last_sync_status})
                                        </span>
                                    </p>
                                )}
                                <div className="flex justify-center gap-2">
                                    <Button onClick={() => setConfirmSyncOpen(true)} disabled={isSyncing}>
                                        {isSyncing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2" /> Sync All to Xero
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="destructive" onClick={handleDisconnect}>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Disconnect
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-slate-600 mb-4">Connect to Xero to automate your bookkeeping.</p>
                                <Button onClick={handleConnect}>
                                    <Zap className="w-4 h-4 mr-2" />
                                    Connect to Xero
                                </Button>
                            </div>
                        )}
                    </div>
                    {/* Confirmation Dialog for Sync */}
                    <ConfirmationDialog
                        open={confirmSyncOpen}
                        onClose={() => setConfirmSyncOpen(false)}
                        onConfirm={handleSyncAll}
                        title="Confirm Full Xero Sync"
                        description="This will push all unsynced sales and payout data to Xero. This action can take a few minutes. Are you sure you want to proceed?"
                        confirmText="Yes, Start Sync"
                        variant="default"
                        isLoading={isSyncing}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Sync History</CardTitle>
                            <CardDescription>A log of the latest data synchronization attempts.</CardDescription>
                        </div>
                        {connection?.sync_history?.length > 0 && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleClearHistory} 
                                disabled={isClearing}
                                className="text-slate-500 hover:text-red-600"
                                aria-label="Clear sync history"
                            >
                                {isClearing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-80 border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {connection?.sync_history?.length > 0 ? (
                                    [...connection.sync_history].reverse().map((log, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-xs whitespace-nowrap">{format(new Date(log.date), 'MMM d, h:mm a')}</TableCell>
                                            <TableCell>
                                                {log.status === 'success' ? (
                                                    <span className="flex items-center gap-1.5 text-xs text-green-600"><CheckCircle className="w-3 h-3"/> Success</span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle className="w-3 h-3"/> Failed</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs">{log.details}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-slate-500">
                                            {connection ? 'No sync history yet. Run a sync to see logs.' : 'Connect to Xero to view sync history.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
