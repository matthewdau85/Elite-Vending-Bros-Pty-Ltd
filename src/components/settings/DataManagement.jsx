import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, FileJson, FileText, Loader2, AlertTriangle, Database } from 'lucide-react';
import { toast } from 'sonner';
import RequireRole from '../auth/RequireRole';
import { exportData } from '@/api/functions';

export default function DataManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  const handleExport = async (format) => {
    setIsExporting(true);
    setExportFormat(format);
    toast.info(`Starting ${format.toUpperCase()} export...`);

    try {
      const { data, headers } = await exportData({ format });

      if (data) {
        const contentType = headers['content-type'];
        const contentDisposition = headers['content-disposition'];
        const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || `export.${format}`;
        
        const blob = new Blob([data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        toast.success(`Data exported successfully as ${filename}`);
      } else {
        throw new Error('Export failed: No data received.');
      }
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <RequireRole requiredRole="admin">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export System Data
            </CardTitle>
            <CardDescription>
              Download a complete backup of your core business data. This is useful for backups, migrations, or external analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="flex-1"
              >
                {isExporting && exportFormat === 'json' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileJson className="w-4 h-4 mr-2" />
                )}
                Export as JSON
              </Button>
              <Button 
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="flex-1"
              >
                {isExporting && exportFormat === 'csv' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Export as CSV (Zip)
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Data
            </CardTitle>
            <CardDescription>
              Bulk-import data from a CSV file. Use with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Import Feature Under Development</AlertTitle>
              <AlertDescription>
                The data import wizard with column mapping and validation is currently being built. This functionality is disabled to prevent accidental data corruption.
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex items-center gap-4">
               <input type="file" disabled className="flex-1" />
               <Button disabled>Start Import</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RequireRole>
  );
}