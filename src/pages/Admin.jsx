
import React, { useState, useEffect } from "react";
import { NayaxSetting, UnmappedProduct, Product } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Key, Zap, Puzzle, MessageSquare, FileText, LayoutGrid, Database, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteAllData } from "@/api/functions";

import NayaxCredentialsForm from "../components/admin/NayaxCredentialsForm";
import SyncController from "../components/admin/SyncController";
import UnmappedProductsTable from "../components/admin/UnmappedProductsTable";
import SQSPanel from "../components/admin/SQSPanel";
import ReportingSettings from "../components/admin/ReportingSettings";
import AppearanceSettings from "../components/admin/AppearanceSettings";
import DatabaseBackup from "../components/admin/DatabaseBackup"; 

export default function AdminPage() {
  const [settings, setSettings] = useState(null);
  const [unmappedProducts, setUnmappedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeletingAllData, setIsDeletingAllData] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [settingsData, unmappedData, productsData] = await Promise.all([
        NayaxSetting.list(),
        UnmappedProduct.filter({ status: "pending" }),
        Product.list()
      ]);
      setSettings(settingsData[0] || null);
      setUnmappedProducts(unmappedData);
      setProducts(productsData);
    } catch (e) {
      console.error("Failed to load admin data:", e);
      setError("Failed to load administration settings. Please try again later.");
    }
    setIsLoading(false);
  };
  
  const handleDeleteAllData = async () => {
    const confirmation1 = window.confirm(
        "DANGER: You are about to delete ALL application data, including machines, products, sales, and locations. This action is IRREVERSIBLE.\n\nAre you sure you want to proceed?"
    );
    if (!confirmation1) return;

    const confirmation2 = window.prompt(
        "To confirm this action, please type 'DELETE ALL DATA' in the box below. This is your final confirmation."
    );
    
    if (confirmation2 !== 'DELETE ALL DATA') {
        alert("Incorrect confirmation text. Data deletion has been cancelled.");
        return;
    }

    setIsDeletingAllData(true);
    try {
        const { data } = await deleteAllData();
        if (data.success) {
            alert("All application data has been successfully deleted. The page will now reload.");
            window.location.reload();
        } else {
            throw new Error(data.error || "An unknown error occurred during deletion.");
        }
    } catch (error) {
        console.error("Failed to delete all data:", error);
        alert(`Error: ${error.message}`);
    } finally {
        setIsDeletingAllData(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-600 mt-1">
            Manage system integrations, data synchronization, and application settings.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid md:grid-cols-6">
            <TabsTrigger value="integrations">
              <Zap className="w-4 h-4 mr-2" /> Integrations
            </TabsTrigger>
            <TabsTrigger value="mapping">
              <Puzzle className="w-4 h-4 mr-2" /> Product Mapping
            </TabsTrigger>
            <TabsTrigger value="sqs">
              <MessageSquare className="w-4 h-4 mr-2" /> SQS Events
            </TabsTrigger>
            <TabsTrigger value="reporting">
              <FileText className="w-4 h-4 mr-2" /> Reporting
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <LayoutGrid className="w-4 h-4 mr-2" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="backup">
              <Database className="w-4 h-4 mr-2" /> Backup
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="integrations">
            <Card className="mt-4 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" /> Nayax API Settings
                </CardTitle>
                <CardDescription>
                  Enter your Nayax API credentials to enable data synchronization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NayaxCredentialsForm settings={settings} onUpdate={loadData} />
              </CardContent>
            </Card>

            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" /> Data Synchronization
                </CardTitle>
                <CardDescription>
                  Manually sync data from Nayax. This process can take several minutes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SyncController settings={settings} onUpdate={loadData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapping">
             <Card className="mt-4 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="w-5 h-5 text-orange-600" /> Unmapped Products
                </CardTitle>
                <CardDescription>
                  Products from Nayax transactions that are not recognized in your catalog. Map them to existing SKUs or create new ones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnmappedProductsTable 
                  unmappedProducts={unmappedProducts}
                  products={products}
                  onUpdate={loadData}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sqs">
            <Card className="mt-4 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" /> Real-time SQS Events
                </CardTitle>
                <CardDescription>
                  Configure real-time event notifications from Nayax using AWS SQS.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SQSPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reporting">
            <Card className="mt-4 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Weekly Report Recipients
                </CardTitle>
                <CardDescription>
                  Manage the email distribution list for automated weekly PDF reports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportingSettings />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <div className="mt-4">
              <AppearanceSettings />
            </div>
          </TabsContent>

          <TabsContent value="backup">
            <div className="mt-4">
              <DatabaseBackup />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12">
          <Card className="border-red-500 border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-600">
                <ShieldAlert className="w-6 h-6" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-500">
                These actions are highly destructive and cannot be undone. Proceed with extreme caution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-bold text-slate-800">Reset Application</h4>
                  <p className="text-sm text-slate-600">Delete all transactional data from every database.</p>
                </div>
                <Button 
                    variant="destructive"
                    onClick={handleDeleteAllData}
                    disabled={isDeletingAllData}
                >
                    {isDeletingAllData ? "Deleting..." : "Delete All Data"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
