import React from 'react';

export default function SecurityPolicy() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2>Security Policy & Hardening</h2>
      <p>This document outlines the comprehensive security model implemented in the Elite Vending Bros application, including role-based access control, multi-layer authentication, and audit trails.</p>
      
      <h3>1. Role-Based Access Control (RBAC)</h3>
      <p>The application employs a strict RBAC model to control access to data and features.</p>
      <h4>Roles</h4>
      <ul>
        <li><strong>admin:</strong> Full access to all application features, including user management, system settings, and destructive operations. Can view all data and access the audit trail.</li>
        <li><strong>manager:</strong> Business operations access including sales analytics, inventory management, and route planning. Cannot perform system administration.</li>
        <li><strong>operator:</strong> Field operations access including route completion, machine servicing, and cash collection. Limited to operational tasks.</li>
        <li><strong>viewer:</strong> Read-only access to dashboards and basic reporting. Cannot modify data or perform operations.</li>
      </ul>

      <h4>Access Controls</h4>
      <ul>
        <li><strong>Client-Side Guards:</strong> Navigation links and UI components are conditionally rendered based on user roles</li>
        <li><strong>Route Protection:</strong> Deep-link access to admin pages is blocked with the <code>RequireRole</code> component</li>
        <li><strong>Server-Side Authorization:</strong> All privileged backend functions verify user roles before execution</li>
      </ul>

      <h3>2. Multi-Layer Authentication</h3>
      <h4>Standard Authentication</h4>
      <p>Users authenticate through Google OAuth, managed by the base44 platform. Session tokens are automatically handled.</p>
      
      <h4>Step-Up Authentication</h4>
      <p>For destructive operations (like data wiping), the system requires step-up authentication:</p>
      <ul>
        <li><strong>Token Generation:</strong> Users re-enter their credentials to receive a short-lived (5-minute) HMAC-signed token</li>
        <li><strong>Token Verification:</strong> Destructive operations verify the token's signature, user ID, and expiration</li>
        <li><strong>Single Use:</strong> Tokens are designed for single-use scenarios and expire quickly</li>
      </ul>

      <h3>3. Safety Rails for Destructive Operations</h3>
      <h4>Backup Prerequisites</h4>
      <p>Before allowing data wiping operations, the system enforces:</p>
      <ul>
        <li><strong>Recent Backup:</strong> A backup must exist within the last 24 hours</li>
        <li><strong>Restore Verification:</strong> The backup must have passed a restore test within 24 hours</li>
        <li><strong>SLA Enforcement:</strong> Both conditions must be met or the operation is blocked with a 412 status</li>
      </ul>

      <h4>Typed Confirmation</h4>
      <p>Users must type the exact phrase "DELETE MY DATA" to enable destructive operation buttons. This prevents accidental clicks and ensures conscious intent.</p>

      <h3>4. Immutable Audit Trail</h3>
      <p>All privileged actions are logged to an append-only audit trail with the following information:</p>
      <ul>
        <li><strong>Timestamp:</strong> Precise time of the action</li>
        <li><strong>User Details:</strong> Email, role, IP address, user agent</li>
        <li><strong>Action Details:</strong> Type of action, target resource, success/failure</li>
        <li><strong>Forensic Data:</strong> Correlation ID for request tracing, request payload hash for integrity</li>
        <li><strong>Context:</strong> Free-text details including error messages and business context</li>
      </ul>

      <h4>Audit Access</h4>
      <p>Audit logs are accessible only to administrators via the <strong>Admin → Audit Trail</strong> page, with features including:</p>
      <ul>
        <li>Searchable and filterable log entries</li>
        <li>CSV export for compliance reporting</li>
        <li>Correlation ID copying for incident investigation</li>
        <li>Read-only access to prevent tampering</li>
      </ul>

      <h3>5. Error Handling & User Experience</h3>
      <p>The application provides status-aware error messages:</p>
      <ul>
        <li><strong>401 Unauthorized:</strong> "Session expired. Please sign in again."</li>
        <li><strong>403 Forbidden:</strong> "Access denied. Admin rights or step-up required."</li>
        <li><strong>412 Precondition Failed:</strong> "Backup required. Run a recent backup & restore probe first."</li>
      </ul>

      <h3>6. Idempotency & Rate Limiting</h3>
      <p>To prevent accidental duplicate operations:</p>
      <ul>
        <li><strong>Correlation ID Tracking:</strong> Duplicate requests with the same correlation ID within 10 minutes return cached results</li>
        <li><strong>Request Deduplication:</strong> Identical payloads are detected using SHA-256 hashing</li>
        <li><strong>Rate Limiting:</strong> Destructive operations are limited to prevent rapid-fire execution</li>
      </ul>

      <h3>7. String Safety</h3>
      <p>The application uses safe utility functions to prevent null/undefined errors:</p>
      <ul>
        <li><code>safeIncludes()</code>, <code>safeLower()</code>, <code>safeArray()</code></li>
        <li>All search and filtering operations use these utilities</li>
        <li>Prevents common runtime errors from null/undefined string operations</li>
      </ul>

      <h3>8. Security Headers & CSP</h3>
      <p>Production deployments should implement:</p>
      <ul>
        <li><strong>Content Security Policy (CSP):</strong> Restricts resource loading to prevent XSS</li>
        <li><strong>HSTS:</strong> Forces HTTPS connections</li>
        <li><strong>X-Frame-Options:</strong> Prevents clickjacking</li>
        <li><strong>X-Content-Type-Options:</strong> Prevents MIME sniffing</li>
      </ul>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-blue-800 font-semibold">Security Checklist for Deployment</h4>
        <ul className="text-blue-700 mt-2">
          <li>✓ All admin functions require role verification</li>
          <li>✓ Destructive operations require step-up authentication</li>
          <li>✓ Backup prerequisites are enforced</li>
          <li>✓ All privileged actions are audited</li>
          <li>✓ String operations use safe utilities</li>
          <li>✓ Error messages are user-friendly and secure</li>
          <li>⚠️ Replace backup status stub with real service integration</li>
          <li>⚠️ Implement real password verification in step-up auth</li>
        </ul>
      </div>
    </div>
  );
}