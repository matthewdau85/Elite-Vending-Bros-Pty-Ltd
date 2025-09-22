
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const CodeBlock = ({ children, lang = 'bash' }) => (
  <pre className="bg-slate-900 text-white p-4 rounded-md my-4 overflow-x-auto">
    <code className={`language-${lang}`}>{children}</code>
  </pre>
);

export default function ApiDocs() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>API Documentation</CardTitle>
          <Button variant="outline" asChild>
            <a href="/functions/getOpenApiSpec" download="openapi.yaml"><Download className="w-4 h-4 mr-2"/>Download OpenAPI Spec</a>
          </Button>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <h2>Authentication</h2>
          <p>
            All API requests must be authenticated with an API key. Include your key in the 
            <code>Authorization</code> header with the <code>Bearer</code> scheme.
          </p>
          <CodeBlock>
            {`curl "https://<your-app-url>/api/v1/getMachine" \\
  -H "Authorization: Bearer evb_sk_..." \\
  -d '{"machine_id": "YOUR_MACHINE_ID"}'`}
          </CodeBlock>

          <h2>Rate Limiting</h2>
          <p>
            The API is rate-limited to 100 requests per minute per API key. Exceeding this limit will result in a 
            <code>429 Too Many Requests</code> error.
          </p>

          <h2>Error Handling</h2>
          <p>
            The API uses standard HTTP status codes. Errors will be returned with a JSON body containing an <code>error</code> key.
          </p>

          <hr className="my-8"/>

          <h2>Endpoints</h2>

          <h3>Get Machine Details</h3>
          <p><code>POST /api/v1/getMachine</code></p>
          <p>Retrieves details for a specific machine, including its location and planogram.</p>
          <strong>Request Body:</strong>
          <CodeBlock lang="json">{`{
  "machine_id": "machine-123"
}`}</CodeBlock>
          <strong>Response:</strong>
          <CodeBlock lang="json">{`{
  "id": "machine-123",
  "machine_id": "VEND-001",
  "location_id": "loc-abc",
  "location_name": "Office Building A",
  "status": "online",
  "planogram": [
    { "slot_number": "A1", "product_sku": "COKE", ... }
  ]
}`}</CodeBlock>

          <h3>List Routes</h3>
          <p><code>POST /api/v1/listRoutes</code></p>
          <p>Retrieves a list of routes, with optional filters.</p>
          <strong>Request Body:</strong>
          <CodeBlock lang="json">{`{
  "status": "planned",
  "assigned_operator": "driver@example.com"
}`}</CodeBlock>

          <hr className="my-8"/>

          <h2>Webhooks</h2>
          <h3>Verifying Signatures</h3>
          <p>
            Each webhook request includes a <code>X-VendingBros-Signature-256</code> header. This is a HMAC-SHA256 signature
            of the raw request body, computed using your webhook's signing secret. You should always verify this signature
            to ensure the request is from us.
          </p>
          <CodeBlock lang="javascript">{`const crypto = require('crypto');

const secret = 'whsec_...'; // Your signing secret
const payload = request.rawBody; // The raw request body as a string
const signature = request.headers['x-vendingbros-signature-256'];

const hmac = crypto.createHmac('sha256', secret);
const digest = 'sha256=' + hmac.update(payload).digest('hex');

if (crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
  // Signature is valid
} else {
  // Signature is invalid
}`}</CodeBlock>
            <h3>Event: <code>vend.success</code></h3>
            <p>Triggered after a successful vend transaction is processed.</p>
            <CodeBlock lang="json">{`{
  "type": "vend.success",
  "data": {
    "transaction_id": "txn_12345",
    "machine_id": "VEND-001",
    "product_sku": "COKE",
    "total_amount": 2.50,
    "sale_datetime": "2023-10-27T10:00:00Z"
  }
}`}</CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
}
