import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';

export default function SetupGuide() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2>Complete Setup Guide</h2>
      <p>This comprehensive guide will walk you through setting up your Elite Vending Bros management system from initial configuration to full operation.</p>
      
      <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-blue-800 font-semibold flex items-center gap-2">
          <Info className="w-5 h-5" />
          Before You Begin
        </h4>
        <p className="text-blue-700 mt-2">
          Ensure you have admin access to your Nayax management console and your machine configuration details ready.
        </p>
      </div>

      <h3>1. Nayax Integration Setup</h3>
      <p>The Nayax integration is the foundation of your data synchronization. Follow these steps carefully:</p>
      
      <h4>Step 1: Obtain Nayax API Credentials</h4>
      <ol>
        <li>Log into your <strong>Nayax Management Console</strong></li>
        <li>Navigate to <strong>Settings → API Management</strong></li>
        <li>Click <strong>"Generate New API Key"</strong></li>
        <li>Copy your <strong>Client ID</strong> and <strong>Client Secret</strong></li>
        <li>Note your <strong>Base URL</strong> (usually https://api.nayax.com)</li>
      </ol>

      <h4>Step 2: Configure Nayax Accounts</h4>
      <ol>
        <li>Go to <strong>Machines → Data Integrations</strong> in this application</li>
        <li>Click <strong>"Add Nayax Account"</strong></li>
        <li>Fill in the form:
          <ul>
            <li><strong>Account Name:</strong> A descriptive name (e.g., "Sydney CBD Account")</li>
            <li><strong>Client ID:</strong> From Nayax console</li>
            <li><strong>Client Secret:</strong> From Nayax console</li>
            <li><strong>Base URL:</strong> Usually https://api.nayax.com</li>
          </ul>
        </li>
        <li>Click <strong>"Test Connection"</strong> to verify credentials</li>
        <li>Save the configuration</li>
      </ol>

      <h4>Step 3: Initial Data Sync</h4>
      <ol>
        <li>Click <strong>"Sync Now"</strong> to perform your first data synchronization</li>
        <li>Monitor the sync status - initial sync can take 5-15 minutes</li>
        <li>Review the sync log for any errors or warnings</li>
        <li>Verify that machines appear in the <strong>Machines</strong> page</li>
      </ol>

      <div className="my-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="text-amber-800 font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Common Sync Issues
        </h4>
        <ul className="text-amber-700 mt-2 space-y-1">
          <li><strong>Authentication Failed:</strong> Double-check your Client ID and Secret</li>
          <li><strong>No Machines Found:</strong> Ensure machines are properly configured in Nayax</li>
          <li><strong>Timeout Errors:</strong> Large datasets may require multiple sync attempts</li>
        </ul>
      </div>

      <h3>2. Location Management</h3>
      <p>Set up your business locations to organize your machine fleet effectively.</p>

      <h4>Adding Locations</h4>
      <ol>
        <li>Navigate to <strong>Locations</strong> page</li>
        <li>Click <strong>"Add Location"</strong></li>
        <li>Complete the location details:
          <ul>
            <li><strong>Name:</strong> Descriptive location name</li>
            <li><strong>Address:</strong> Complete physical address</li>
            <li><strong>Location Type:</strong> Office, University, Hospital, etc.</li>
            <li><strong>Contact Information:</strong> On-site contact details</li>
            <li><strong>Status:</strong> Active/Inactive</li>
          </ul>
        </li>
        <li>Save the location</li>
      </ol>

      <h4>Location Best Practices</h4>
      <ul>
        <li>Use consistent naming conventions (e.g., "Building Name - Floor")</li>
        <li>Include GPS coordinates for route optimization</li>
        <li>Maintain accurate contact information</li>
        <li>Set appropriate location types for better analytics</li>
      </ul>

      <h3>3. Machine Configuration</h3>
      <p>Configure your vending machines with proper location assignments and settings.</p>

      <h4>Machine Setup Process</h4>
      <ol>
        <li>Go to <strong>Machines</strong> page</li>
        <li>If machines were synced from Nayax, verify their details</li>
        <li>For manual addition, click <strong>"Add Machine"</strong></li>
        <li>Configure machine details:
          <ul>
            <li><strong>Machine ID:</strong> Unique identifier</li>
            <li><strong>Location:</strong> Assign to a location</li>
            <li><strong>Machine Type:</strong> Snack, Drink, Combo, etc.</li>
            <li><strong>Model & Serial Number:</strong> For maintenance tracking</li>
            <li><strong>Capacity:</strong> Number of product slots</li>
            <li><strong>Temperature Settings:</strong> For refrigerated units</li>
          </ul>
        </li>
        <li>Set machine status appropriately</li>
      </ol>

      <h3>4. Product Catalog Setup</h3>
      <p>Build your comprehensive product catalog for inventory management.</p>

      <h4>Adding Products</h4>
      <ol>
        <li>Navigate to <strong>Inventory</strong> page</li>
        <li>Click <strong>"Add Product"</strong></li>
        <li>Enter product information:
          <ul>
            <li><strong>SKU:</strong> Unique product code</li>
            <li><strong>Name & Brand:</strong> Product identification</li>
            <li><strong>Category:</strong> Snacks, Beverages, etc.</li>
            <li><strong>Pricing:</strong> Base cost and selling price</li>
            <li><strong>GST Rate:</strong> Tax configuration</li>
            <li><strong>Supplier:</strong> Link to supplier record</li>
            <li><strong>Storage Requirements:</strong> Ambient, Chilled, Frozen</li>
          </ul>
        </li>
        <li>Upload product images if available</li>
        <li>Set product status (Active/Discontinued)</li>
      </ol>

      <h4>Supplier Management</h4>
      <p>Before adding products, set up your suppliers:</p>
      <ol>
        <li>Go to <strong>Inventory → Suppliers</strong></li>
        <li>Add supplier details including contact information and payment terms</li>
        <li>Link products to appropriate suppliers for procurement management</li>
      </ol>

      <h3>5. Stock Level Configuration</h3>
      <p>Set up initial stock levels and par levels for each machine-product combination.</p>

      <h4>Stock Setup Process</h4>
      <ol>
        <li>Go to <strong>Inventory → Stock Overview</strong></li>
        <li>For each machine, configure product slots:
          <ul>
            <li><strong>Slot Assignment:</strong> A1, B2, etc.</li>
            <li><strong>Product Mapping:</strong> Which product goes in each slot</li>
            <li><strong>Capacity:</strong> Maximum units per slot</li>
            <li><strong>Par Level:</strong> Reorder trigger point</li>
            <li><strong>Current Stock:</strong> Initial inventory count</li>
            <li><strong>Pricing:</strong> Machine-specific pricing if different from base</li>
          </ul>
        </li>
        <li>Set up low-stock alerts</li>
        <li>Configure automated reorder suggestions</li>
      </ol>

      <h3>6. Route Planning Setup</h3>
      <p>Organize your service routes for efficient machine maintenance and restocking.</p>

      <h4>Creating Routes</h4>
      <ol>
        <li>Navigate to <strong>Routes</strong> page</li>
        <li>Click <strong>"Create New Route"</strong></li>
        <li>Configure route details:
          <ul>
            <li><strong>Route Name:</strong> Geographic or descriptive name</li>
            <li><strong>Assigned Operator:</strong> Team member responsible</li>
            <li><strong>Machine Selection:</strong> Add machines to the route</li>
            <li><strong>Frequency:</strong> Daily, Weekly, etc.</li>
            <li><strong>Estimated Duration:</strong> Time planning</li>
          </ul>
        </li>
        <li>Save and activate the route</li>
      </ol>

      <h3>7. User Management & Permissions</h3>
      <p>Set up team members with appropriate access levels.</p>

      <h4>User Roles Overview</h4>
      <ul>
        <li><strong>Admin:</strong> Full system access and user management</li>
        <li><strong>Manager:</strong> Business operations and reporting</li>
        <li><strong>Operator:</strong> Route execution and field operations</li>
        <li><strong>Viewer:</strong> Read-only dashboard access</li>
      </ul>

      <h4>Inviting Users</h4>
      <p>User invitations are managed through the base44 platform:</p>
      <ol>
        <li>Go to your base44 project dashboard</li>
        <li>Navigate to the <strong>Users</strong> tab</li>
        <li>Click <strong>"Invite User"</strong></li>
        <li>Enter email and select appropriate role</li>
        <li>User receives invitation email with setup instructions</li>
      </ol>

      <h3>8. Initial Testing & Validation</h3>
      <p>Before going live, validate your setup with these tests.</p>

      <h4>Data Sync Test</h4>
      <ul>
        <li>Perform a manual sync and verify all machines appear</li>
        <li>Check that sales data is flowing correctly</li>
        <li>Validate product mappings</li>
      </ul>

      <h4>User Access Test</h4>
      <ul>
        <li>Test login with different user roles</li>
        <li>Verify appropriate page access restrictions</li>
        <li>Test mobile access for field operators</li>
      </ul>

      <h4>Alert System Test</h4>
      <ul>
        <li>Simulate low stock conditions</li>
        <li>Test machine offline detection</li>
        <li>Verify alert notifications</li>
      </ul>

      <h3>9. Go-Live Checklist</h3>
      
      <div className="my-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">Pre-Launch Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Nayax integration configured and tested</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>All locations and machines properly configured</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Product catalog complete with accurate pricing</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Initial stock levels set and verified</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Service routes planned and assigned</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Team members invited and trained</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Alert thresholds configured</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Backup and security measures in place</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3>10. Ongoing Maintenance</h3>
      <p>After launch, maintain your system with these regular tasks:</p>

      <h4>Daily Tasks</h4>
      <ul>
        <li>Review critical alerts and resolve issues</li>
        <li>Monitor sync status and data flow</li>
        <li>Check route completion status</li>
      </ul>

      <h4>Weekly Tasks</h4>
      <ul>
        <li>Review sales performance and trends</li>
        <li>Update product pricing as needed</li>
        <li>Audit user access and permissions</li>
      </ul>

      <h4>Monthly Tasks</h4>
      <ul>
        <li>Comprehensive system health check</li>
        <li>Review and optimize routes</li>
        <li>Update product catalog and supplier information</li>
        <li>Generate compliance reports</li>
      </ul>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="text-green-800 font-semibold">Need Help?</h4>
        <p className="text-green-700 mt-2">
          If you encounter issues during setup, use the AI Assistant feature or refer to the other help sections for detailed troubleshooting guides.
        </p>
      </div>
    </div>
  );
}