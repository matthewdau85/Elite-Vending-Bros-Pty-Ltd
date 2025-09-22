
import React, { useState, useEffect } from 'react';
import { ProductBatch, Product, InventoryTransaction } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, Calendar, AlertTriangle, CheckCircle, 
  XCircle, Search, Download, AlertCircle, Trash2
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { toast } from 'sonner';
import LoadingSpinner from '../shared/LoadingSpinner';
import FeatureGate from '../features/FeatureGate';
import { generateExpiryReport } from '@/api/functions';
import { processLotRecall } from '@/api/functions';

export default function BatchManager() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [expiryReport, setExpiryReport] = useState(null);
  const [selectedBatches, setSelectedBatches] = useState(new Set());
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [batchData, productData] = await Promise.all([
        ProductBatch.list('-expiry_date'),
        Product.list()
      ]);
      setBatches(batchData);
      setProducts(productData);
    } catch (error) {
      toast.error('Failed to load batch data');
      console.error('Error loading batch data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateExpiry = async () => {
    try {
      const response = await generateExpiryReport({ days_ahead: 30 });
      setExpiryReport(response.data.report);
      toast.success('Expiry report generated');
    } catch (error) {
      toast.error('Failed to generate expiry report');
    }
  };
  
  const handleBulkRecall = async () => {
    if (selectedBatches.size === 0) {
      toast.error('Please select batches to recall');
      return;
    }
    
    const batchCodes = Array.from(selectedBatches);
    const reason = prompt('Enter recall reason:');
    if (!reason) return;
    
    try {
      const response = await processLotRecall({
        batch_codes: batchCodes,
        recall_reason: reason,
        create_alerts: true
      });
      toast.success(`Initiated recall for ${batchCodes.length} batches`);
      setSelectedBatches(new Set());
      loadData();
    } catch (error) {
      toast.error('Failed to initiate recall');
    }
  };
  
  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry < 0) return { status: 'expired', days: Math.abs(daysToExpiry), color: 'bg-red-100 text-red-800' };
    if (daysToExpiry <= 3) return { status: 'critical', days: daysToExpiry, color: 'bg-red-100 text-red-800' };
    if (daysToExpiry <= 7) return { status: 'warning', days: daysToExpiry, color: 'bg-yellow-100 text-yellow-800' };
    if (daysToExpiry <= 14) return { status: 'soon', days: daysToExpiry, color: 'bg-blue-100 text-blue-800' };
    return { status: 'good', days: daysToExpiry, color: 'bg-green-100 text-green-800' };
  };
  
  const filteredBatches = batches.filter(batch => {
    const product = products.find(p => p.sku === batch.product_sku);
    const productName = product?.name || '';
    const searchMatch = searchTerm === '' || 
      batch.batch_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.lot_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || batch.recall_status === statusFilter;
    
    const expiryStatus = getExpiryStatus(batch.expiry_date);
    const expiryMatch = expiryFilter === 'all' || 
      (expiryFilter === 'expiring' && ['critical', 'warning', 'soon'].includes(expiryStatus.status)) ||
      (expiryFilter === 'expired' && expiryStatus.status === 'expired');
    
    return searchMatch && statusMatch && expiryMatch;
  });
  
  if (loading) {
    return <LoadingSpinner text="Loading inventory batches..." />;
  }
  
  return (
    <FeatureGate featureKey="inventory.lottracking" fallback={
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Lot tracking is not enabled. Contact your administrator to enable this feature.
        </AlertDescription>
      </Alert>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Batch & Lot Management</h2>
            <p className="text-slate-600">Track inventory batches, expiry dates, and manage recalls</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateExpiry} variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Expiry Report
            </Button>
            {selectedBatches.size > 0 && (
              <Button onClick={handleBulkRecall} variant="destructive">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Recall Selected ({selectedBatches.size})
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="batches" className="w-full">
          <TabsList>
            <TabsTrigger value="batches">Active Batches</TabsTrigger>
            <TabsTrigger value="expiry">Expiry Analysis</TabsTrigger>
            <TabsTrigger value="recalled">Recalled Items</TabsTrigger>
          </TabsList>
          
          <TabsContent value="batches" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search batches, lots, or products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="quarantined">Quarantined</option>
                  </select>
                  <select
                    value={expiryFilter}
                    onChange={(e) => setExpiryFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Expiry</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            {/* Batches List */}
            <div className="grid gap-4">
              {filteredBatches.map(batch => {
                const product = products.find(p => p.sku === batch.product_sku);
                const expiryStatus = getExpiryStatus(batch.expiry_date);
                const isSelected = selectedBatches.has(batch.batch_code);
                
                return (
                  <Card key={batch.id} className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSelected = new Set(selectedBatches);
                              if (e.target.checked) {
                                newSelected.add(batch.batch_code);
                              } else {
                                newSelected.delete(batch.batch_code);
                              }
                              setSelectedBatches(newSelected);
                            }}
                            className="mt-1"
                          />
                          <Package className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{product?.name || "Unknown Product"}</span>
                              <Badge variant="outline">{batch.batch_code}</Badge>
                              {batch.lot_number && (
                                <Badge variant="outline">Lot: {batch.lot_number}</Badge>
                              )}
                            </div>
                            <div className="text-sm text-slate-600 space-y-1">
                              <div>Quantity: {batch.quantity_remaining} / {batch.quantity_received} units</div>
                              <div>Location: {batch.storage_location || 'Unspecified'}</div>
                              <div>Received: {format(new Date(batch.received_date), 'MMM d, yyyy')}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <Badge className={expiryStatus.color}>
                            {expiryStatus.status === 'expired' ? 
                              `Expired ${expiryStatus.days} days ago` :
                              `${expiryStatus.days} days to expiry`
                            }
                          </Badge>
                          <div className="text-sm text-slate-500">
                            Expires: {format(new Date(batch.expiry_date), 'MMM d, yyyy')}
                          </div>
                          {batch.recall_status === 'recalled' && (
                            <Badge className="bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Recalled
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="expiry">
            {expiryReport ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{expiryReport.summary.total_batches}</div>
                      <p className="text-sm text-slate-600">Expiring Batches</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600">{expiryReport.summary.critical_items}</div>
                      <p className="text-sm text-slate-600">Critical (≤3 days)</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-yellow-600">{expiryReport.summary.warning_items}</div>
                      <p className="text-sm text-slate-600">Warning (≤7 days)</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">${(expiryReport.summary.total_value_cents / 100).toFixed(2)}</div>
                      <p className="text-sm text-slate-600">At Risk Value</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recommendations */}
                {expiryReport.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {expiryReport.recommendations.slice(0, 10).map((rec, index) => (
                          <Alert key={index} className={rec.priority === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{rec.message}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Click "Expiry Report" to generate analysis</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="recalled">
            <div className="space-y-4">
              {batches.filter(b => b.recall_status === 'recalled').map(batch => {
                const product = products.find(p => p.sku === batch.product_sku);
                
                return (
                  <Card key={batch.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{product?.name || batch.product_sku}</span>
                              <Badge variant="outline">{batch.batch_code}</Badge>
                              <Badge className="bg-red-100 text-red-800">Recalled</Badge>
                            </div>
                            <div className="text-sm text-slate-600">
                              Reason: {batch.recall_reason}
                            </div>
                            <div className="text-sm text-slate-600">
                              Original Quantity: {batch.quantity_received} units
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGate>
  );
}
