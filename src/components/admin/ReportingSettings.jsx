
import React, { useState, useEffect } from "react";
import { ReportRecipient } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Mail, Users, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ReportingSettings() {
  const [recipients, setRecipients] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    setIsLoading(true);
    try {
      const data = await ReportRecipient.list();
      setRecipients(data);
    } catch (error) {
      console.error("Error loading recipients:", error);
    }
    setIsLoading(false);
  };

  const handleAddRecipient = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsSubmitting(true);
    try {
      await ReportRecipient.create({ email: newEmail });
      setNewEmail("");
      setMessage("Email added successfully!");
      setTimeout(() => setMessage(""), 3000);
      loadRecipients();
    } catch (error) {
      console.error("Error adding recipient:", error);
      setMessage("Failed to add email. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleRemoveRecipient = async (id) => {
    try {
      await ReportRecipient.delete(id);
      loadRecipients();
    } catch (error) {
      console.error("Error removing recipient:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Recipient */}
      <Card className="p-6">
        <form onSubmit={handleAddRecipient} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Add Weekly Report Recipient
            </Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@company.com"
                required
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting || !newEmail}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Message */}
      {message && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Recipients */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Current Recipients ({recipients.length})</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : recipients.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h4 className="font-medium text-slate-900 mb-2">No Recipients Added</h4>
            <p className="text-slate-500 text-sm">
              Add email addresses above to receive automated weekly PDF reports.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recipients.map((recipient) => (
              <div key={recipient.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-slate-900">{recipient.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveRecipient(recipient.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Report Schedule Info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Automated Weekly Reports</h4>
            <p className="text-blue-800 text-sm">
              Reports are automatically generated and sent every Monday at 9:00 AM to the recipients listed above.
              Each report includes sales data, machine performance, alerts summary, and financial overview from the previous week.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
