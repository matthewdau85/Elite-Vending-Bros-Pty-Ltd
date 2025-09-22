
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"; // Added ScrollArea import
import {
  FileText,
  Printer,
  Download,
  Package,
  MapPin
} from "lucide-react";
import { format } from "date-fns";

export default function PickingListDialog({ open, onClose, items }) {
  const generatePDF = () => {
    // This would typically integrate with a PDF generation service
    alert("PDF generation will be implemented in the next phase");
  };

  const handlePrint = () => { // Renamed from printList to handlePrint
    window.print();
  };

  if (!items || items.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Updated className for DialogContent to standardize width and enable flex column layout for ScrollArea */}
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Picking List - {format(new Date(), "MMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        {/* Wrapped the main content in ScrollArea to handle overflow */}
        <ScrollArea className="flex-1 py-4 px-6"> {/* flex-1 allows it to take available vertical space, py-4 px-6 for padding */}
          <div className="space-y-6" id="picking-list-content">
            {/* Summary */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Total Products</p>
                  <p className="font-semibold">{items.length}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total Units</p>
                  <p className="font-semibold">
                    {items.reduce((sum, item) => sum + item.total_needed, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Est. Cost</p>
                  <p className="font-semibold">
                    ${items.reduce((sum, item) =>
                      sum + (item.total_needed * (item.product.base_cost || 0)), 0
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Machines Affected</p>
                  <p className="font-semibold">
                    {items.reduce((sum, item) => sum + item.machines_needing_stock.length, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.sku} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.product.name}</h4>
                      <p className="text-sm text-slate-500">
                        SKU: {item.product.sku} • {item.supplier?.name || "No Supplier"}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {item.total_needed} units needed
                      </Badge>
                    </div>
                  </div>

                  {/* Machine Details */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-slate-700">Required for machines:</h5>
                    <div className="grid gap-2">
                      {item.machines_needing_stock.map((machine, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{machine.machine_id}</span>
                            <span className="text-slate-500">Slot {machine.slot_number}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-600">{machine.location_name}</span>
                            </div>
                            <span className="font-medium">
                              {machine.needed} units (current: {machine.current_stock})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handlePrint}> {/* Updated onClick to handlePrint */}
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={generatePDF} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
