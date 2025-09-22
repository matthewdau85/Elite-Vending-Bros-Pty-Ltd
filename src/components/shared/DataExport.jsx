import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  FileText, 
  Database,
  Calendar,
  Filter
} from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { format, subDays } from "date-fns";

export default function DataExport({ entityName, data, filename }) {
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [exportFormat, setExportFormat] = useState("csv");

  const availableFields = data.length > 0 ? Object.keys(data[0]) : [];

  const handleFieldToggle = (field, checked) => {
    if (checked) {
      setSelectedFields(prev => [...prev, field]);
    } else {
      setSelectedFields(prev => prev.filter(f => f !== field));
    }
  };

  const selectAllFields = () => {
    setSelectedFields(availableFields);
  };

  const clearAllFields = () => {
    setSelectedFields([]);
  };

  const exportToCSV = (filteredData) => {
    if (filteredData.length === 0) return;

    const headers = selectedFields.length > 0 ? selectedFields : availableFields;
    const csvContent = [
      headers.join(','), // Header row
      ...filteredData.map(row => 
        headers.map(field => {
          const value = row[field];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const exportToJSON = (filteredData) => {
    const jsonContent = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  const handleExport = () => {
    // Filter data by date range if applicable
    let filteredData = data;
    
    // Look for date fields to filter by
    const dateFields = ['created_date', 'sale_datetime', 'alert_datetime', 'visit_datetime'];
    const dateField = dateFields.find(field => availableFields.includes(field));
    
    if (dateField && dateRange.from && dateRange.to) {
      filteredData = data.filter(row => {
        const rowDate = new Date(row[dateField]);
        return rowDate >= dateRange.from && rowDate <= dateRange.to;
      });
    }

    // Filter by selected fields
    if (selectedFields.length > 0) {
      filteredData = filteredData.map(row => {
        const filteredRow = {};
        selectedFields.forEach(field => {
          filteredRow[field] = row[field];
        });
        return filteredRow;
      });
    }

    if (exportFormat === "csv") {
      exportToCSV(filteredData);
    } else {
      exportToJSON(filteredData);
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Export {entityName} Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range Filter
            </Label>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Select Fields ({selectedFields.length} of {availableFields.length})
              </Label>
              <div className="space-x-2">
                <Button size="sm" variant="outline" onClick={selectAllFields}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={clearAllFields}>
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {availableFields.map(field => (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedFields.includes(field)}
                    onCheckedChange={(checked) => handleFieldToggle(field, checked)}
                  />
                  <Label className="text-sm font-mono">{field}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="csv"
                  name="format"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <Label htmlFor="csv" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CSV (Excel)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="json"
                  name="format"
                  value="json"
                  checked={exportFormat === "json"}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <Label htmlFor="json" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  JSON
                </Label>
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Total records: {data.length}</li>
              <li>• Selected fields: {selectedFields.length || availableFields.length}</li>
              <li>• Format: {exportFormat.toUpperCase()}</li>
              <li>• Date range: {dateRange.from ? format(dateRange.from, 'MMM d') : 'All'} - {dateRange.to ? format(dateRange.to, 'MMM d') : 'All'}</li>
            </ul>
          </div>

          <Button onClick={handleExport} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export {entityName} Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}