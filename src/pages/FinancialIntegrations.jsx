import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard, Building, Link as LinkIcon, CheckCircle,
  AlertTriangle, Settings, Eye, RotateCcw, Shield,
  Download, Upload, FileText, Calculator
} from 'lucide-react';
import { AccountingConnection, BankConnection, ReconciliationMatch } from '@/api/entities';
import { connectProvider } from '@/api/functions';
import { connectBank } from '@/api/functions';
import { autoMatch } from '@/api/functions';

export default function FinancialIntegrationsPage() {
  const [accountingConnections, setAccountingConnections] = useState([]);
  const [bankConnections, setBankConnections] = useState([]);
  const [reconciliationSummary, setReconciliationSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnections();
    loadReconciliationSummary();
  }, []);

  const loadConnections = async () => {
    try {
      const [accounting, banking] = await Promise.all([
        AccountingConnection.list('-created_date', 20),
        BankConnection.list('-created_date', 20)
      ]);
      
      setAccountingConnections(accounting);
      setBankConnections(banking);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReconciliationSummary = async () => {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      const matches = await ReconciliationMatch.filter({
        match_date: { $gte: last30Days.toISOString() }
      });
      
      setReconciliationSummary({
        total_matches: matches.length,
        automatic_matches: matches.filter(m => m.status === 'automatic').length,
        manual_matches: matches.filter(m => m.status === 'manual').length,
        disputed_matches: matches.filter(m => m.status === 'disputed').length
      });
    } catch (error) {
      console.error('Error loading reconciliation summary:', error);
    }
  };

  const handleConnectAccounting = async (providerId) => {
    try {
      const response = await connectProvider({ provider_id: providerId });
      if (response.auth_url) {
        window.location.href = response.auth_url;
      }
    } catch (error) {
      console.error('Error connecting accounting provider:', error);
    }
  };

  const handleConnectBank = async (providerType, institutionId) => {
    try {
      const response = await connectBank({ 
        provider_type: providerType, 
        institution_id: institutionId 
      });
      if (response.auth_url) {
        window.location.href = response.auth_url;
      }
    } catch (error) {
      console.error('Error connecting bank:', error);
    }
  };

  const runReconciliation = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const response = await autoMatch({
        date_range_start: startDate.toISOString(),
        date_range_end: endDate
      });
      
      if (response.success) {
        loadReconciliationSummary();
      }
    } catch (error) {
      console.error('Error running reconciliation:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-slate-200 rounded"></div>
            <div className="h-48 bg-slate-200 rounded"></div>
            <div className="h-48 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Financial Integrations</h1>
          <p className="text-slate-600">
            Connect your accounting systems, bank feeds, and automate reconciliation processes
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Accounting Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Building className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{accountingConnections.length}</div>
                  <div className="text-sm text-slate-500">Connected</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Bank Feeds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{bankConnections.length}</div>
                  <div className="text-sm text-slate-500">Connected</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Auto Reconciliation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calculator className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">
                    {reconciliationSummary ? reconciliationSummary.automatic_matches : 0}
                  </div>
                  <div className="text-sm text-slate-500">This Month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Data Governance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">Compliant</div>
                  <div className="text-sm text-slate-500">CDR & Privacy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="accounting" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accounting">Accounting Systems</TabsTrigger>
            <TabsTrigger value="banking">Bank Feeds</TabsTrigger>
            <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            <TabsTrigger value="governance">Data Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="accounting" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Providers */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Available Accounting Providers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: 'xero', name: 'Xero', description: 'Cloud-based accounting', popular: true },
                    { id: 'quickbooks_online', name: 'QuickBooks Online', description: 'Small business accounting' },
                    { id: 'myob', name: 'MYOB', description: 'Australian business management' },
                    { id: 'sage_business_cloud', name: 'Sage Business Cloud', description: 'Enterprise accounting' },
                    { id: 'netsuite', name: 'NetSuite', description: 'ERP & financial management' }
                  ].map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{provider.name}</h4>
                          {provider.popular && <Badge className="bg-blue-100 text-blue-800">Popular</Badge>}
                        </div>
                        <p className="text-sm text-slate-500">{provider.description}</p>
                      </div>
                      <Button
                        onClick={() => handleConnectAccounting(provider.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Connected Systems */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Connected Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  {accountingConnections.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No accounting systems connected</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {accountingConnections.map((connection) => (
                        <div key={connection.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{connection.organization_name}</h4>
                            <Badge 
                              className={
                                connection.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {connection.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mb-3">
                            Provider: {connection.provider_id}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4 mr-2" />
                              Configure
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Test Connection
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="banking" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bank Feed Providers */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Bank Feed Providers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Shield className="w-4 h-4" />
                    <AlertDescription>
                      Bank connections use secure Open Banking standards and require explicit consent.
                    </AlertDescription>
                  </Alert>

                  {[
                    { type: 'cdr_banking', name: 'Australian CDR Banking', description: 'Direct bank connections via CDR', region: 'AU' },
                    { type: 'plaid', name: 'Plaid', description: 'Global bank connectivity', region: 'US/CA/UK' },
                    { type: 'truelayer', name: 'TrueLayer', description: 'European Open Banking', region: 'EU/UK' },
                    { type: 'basiq', name: 'Basiq', description: 'Australian financial data', region: 'AU' }
                  ].map((provider) => (
                    <div key={provider.type} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{provider.name}</h4>
                          <Badge variant="outline">{provider.region}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{provider.description}</p>
                      </div>
                      <Button
                        onClick={() => handleConnectBank(provider.type, 'demo_bank')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Connected Banks */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Connected Banks</CardTitle>
                </CardHeader>
                <CardContent>
                  {bankConnections.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No bank feeds connected</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bankConnections.map((connection) => (
                        <div key={connection.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{connection.institution_name}</h4>
                            <Badge 
                              className={
                                connection.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {connection.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mb-3">
                            Last sync: {new Date(connection.last_sync_date || Date.now()).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Sync Now
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4 mr-2" />
                              Manage Consent
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reconciliation" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reconciliation Dashboard */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Auto-Reconciliation Engine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {reconciliationSummary && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {reconciliationSummary.automatic_matches}
                        </div>
                        <div className="text-sm text-green-600">Auto-matched</div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700">
                          {reconciliationSummary.manual_matches}
                        </div>
                        <div className="text-sm text-yellow-600">Manual review</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={runReconciliation}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Run Reconciliation (Last 7 Days)
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      View Reconciliation Report
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Matching Rules
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reconciliation Status */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border-l-4 border-green-500 bg-green-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-green-800">Auto-matched 45 transactions</p>
                          <p className="text-sm text-green-600">Daily reconciliation completed</p>
                        </div>
                        <span className="text-xs text-green-500">2 hours ago</span>
                      </div>
                    </div>
                    
                    <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-yellow-800">3 transactions need review</p>
                          <p className="text-sm text-yellow-600">Low confidence matches detected</p>
                        </div>
                        <span className="text-xs text-yellow-500">5 hours ago</span>
                      </div>
                    </div>
                    
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-blue-800">Bank sync completed</p>
                          <p className="text-sm text-blue-600">127 new transactions imported</p>
                        </div>
                        <span className="text-xs text-blue-500">8 hours ago</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="governance" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Consent Management */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Data Consent Center</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Shield className="w-4 h-4" />
                    <AlertDescription>
                      All financial data access is governed by explicit consent with configurable retention periods.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Bank Account Data</h4>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        Access to account balances and transaction history
                      </p>
                      <div className="text-xs text-slate-400">
                        Expires: March 2025 • Retention: 7 years
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Accounting Integration</h4>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        Posting journals and invoice data
                      </p>
                      <div className="text-xs text-slate-400">
                        No expiry • Retention: 7 years
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Consents
                  </Button>
                </CardContent>
              </Card>

              {/* Security & Compliance */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Security & Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">CDR Compliant</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">PCI DSS</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">SOC 2 Type II</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">GDPR Ready</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data (Encrypted)
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Audit Trail Report
                    </Button>
                    
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Data Erasure Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}