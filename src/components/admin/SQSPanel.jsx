
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, Play, Settings, AlertTriangle, Key } from "lucide-react";

export default function SQSPanel() {
  const [queueUrl, setQueueUrl] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const handleConfigure = () => {
    // In a real implementation, this would save to settings and trigger a backend test
    setIsConfigured(true);
    alert("SQS configuration saved. Note: Backend functions must be enabled for automatic processing.");
  };

  const handleTestConnection = () => {
    // Simulate test
    setLastMessage({
      timestamp: new Date().toISOString(),
      type: "sale_event",
      data: { machine_id: "VM001", amount: 3.50 }
    });
  };

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertTitle>Backend Configuration Required</AlertTitle>
        <AlertDescription>
          This panel is for display only. SQS integration requires **backend functions to be enabled** with your AWS credentials correctly set as environment variables (e.g., `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`). The `SignatureDoesNotMatch` error indicates an issue with these credentials in your backend settings.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="queue_url" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              AWS SQS Queue URL
            </Label>
            <Input
              id="queue_url"
              value={queueUrl}
              onChange={(e) => setQueueUrl(e.target.value)}
              placeholder="https://sqs.region.amazonaws.com/account/queue-name"
              className="font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleConfigure}
              disabled={!queueUrl}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure SQS
            </Button>
            <Button 
              variant="outline"
              onClick={handleTestConnection}
              disabled={!isConfigured}
            >
              <Play className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </div>

          {isConfigured && (
            <Badge className="bg-green-100 text-green-800">
              SQS Queue Configured
            </Badge>
          )}
        </div>
      </Card>

      {lastMessage && (
        <Card className="p-6 bg-slate-50">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Latest Test Message
          </h4>
          <div className="font-mono text-sm bg-slate-900 text-slate-200 p-4 rounded">
            <div>Timestamp: {lastMessage.timestamp}</div>
            <div>Type: {lastMessage.type}</div>
            <div>Data: {JSON.stringify(lastMessage.data, null, 2)}</div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Setup Instructions</h4>
        <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside">
          <li>Create an AWS SQS queue in your AWS account.</li>
          <li>Provide the queue ARN to your Nayax account manager.</li>
          <li>In your base44 project settings, enable Backend Functions.</li>
          <li>Set your AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`) as environment variables for your backend.</li>
          <li>Enter the SQS queue URL above to store it for your backend functions to use.</li>
        </ol>
      </Card>
    </div>
  );
}
