import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Send, Loader2 } from "lucide-react";
import { sendReportByEmail } from "@/api/functions";

export default function SendReportDialog({ open, onClose, reportType, reportName }) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    setMessage({ type: "", content: "" });

    try {
      const response = await sendReportByEmail({ to_email: email, report_type: reportType });
      if (response.data.success) {
        setMessage({ type: "success", content: `Successfully sent ${reportName} to ${email}.` });
        setEmail("");
        setTimeout(() => {
          onClose();
          setMessage({ type: "", content: "" });
        }, 3000);
      } else {
        throw new Error(response.data.error || "An unknown error occurred.");
      }
    } catch (error) {
      setMessage({ type: "error", content: `Failed to send report: ${error.message}` });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isSending) onClose(isOpen); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send {reportName} by Email</DialogTitle>
          <DialogDescription>
            Enter the recipient's email address below. A PDF version of the report will be generated and sent.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSend}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            {message.content && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                <AlertDescription>{message.content}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSending || !email}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}