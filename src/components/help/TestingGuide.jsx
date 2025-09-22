import React from 'react';

export default function TestingGuide() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2>Testing Strategy & Security Validation</h2>
      <p>This guide outlines the testing approach for validating the security hardening and functionality of the Elite Vending Bros application.</p>
      
      <h3>1. Security Boundary Testing</h3>
      <h4>Role-Based Access Control Tests</h4>
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
        <p><strong>Test Case: Non-admin cannot access admin pages</strong></p>
        <p>1. Login as non-admin user (viewer/operator)</p>
        <p>2. Verify "System" nav group is not visible in sidebar</p>
        <p>3. Attempt direct navigation to /settings and /users</p>
        <p>4. Verify "Access Denied" page is shown</p>
        <p>5. Attempt API calls to admin functions</p>
        <p>6. Verify 403 Forbidden responses</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mt-4">
        <p><strong>Test Case: Admin can access all features</strong></p>
        <p>1. Login as admin user</p>
        <p>2. Verify "System" nav group is visible</p>
        <p>3. Navigate to /settings and /users successfully</p>
        <p>4. Verify admin-only UI sections are visible</p>
        <p>5. Verify API calls to admin functions succeed</p>
      </div>

      <h4>Step-Up Authentication Tests</h4>
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
        <p><strong>Test Case: Destructive operation requires step-up</strong></p>
        <p>1. Login as admin</p>
        <p>2. Navigate to Settings → Wipe Data</p>
        <p>3. Try to wipe without step-up authentication</p>
        <p>4. Verify button remains disabled</p>
        <p>5. Perform step-up authentication</p>
        <p>6. Verify button becomes enabled</p>
        <p>7. Wait 5+ minutes and verify token expires</p>
      </div>

      <h4>Backup Prerequisite Tests</h4>
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
        <p><strong>Test Case: Data wipe blocked without valid backup</strong></p>
        <p>1. Mock backup status to return hasRecentBackup: false</p>
        <p>2. Attempt data wipe operation</p>
        <p>3. Verify 412 Precondition Failed response</p>
        <p>4. Mock backup status to return restoreStatus: 'FAIL'</p>
        <p>5. Verify operation is still blocked</p>
        <p>6. Mock valid backup status</p>
        <p>7. Verify operation is allowed to proceed</p>
      </div>

      <h3>2. Audit Trail Testing</h3>
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
        <p><strong>Test Case: All privileged actions are audited</strong></p>
        <p>1. Perform admin actions (user management, data wipe, etc.)</p>
        <p>2. Check audit trail for corresponding entries</p>
        <p>3. Verify all required fields are populated:</p>
        <p>   - timestamp, user_email, action, status</p>
        <p>   - correlation_id, request_hash, ip_address</p>
        <p>4. Verify failed actions are also logged</p>
        <p>5. Test audit log export to CSV</p>
      </div>

      <h3>3. Idempotency Testing</h3>
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
        <p><strong>Test Case: Duplicate operations are handled safely</strong></p>
        <p>1. Perform a destructive operation with correlation_id</p>
        <p>2. Repeat the exact same request within 10 minutes</p>
        <p>3. Verify second request returns cached result</p>
        <p>4. Verify operation is not duplicated</p>
        <p>5. Test with different correlation_id (should execute)</p>
      </div>

      <h3>4. Error Handling Testing</h3>
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
        <p><strong>Test Case: Status-aware error messages</strong></p>
        <p>1. Trigger 401 error (expired session)</p>
        <p>2. Verify user sees "Session expired" message</p>
        <p>3. Trigger 403 error (insufficient permissions)</p>
        <p>4. Verify user sees "Access denied" message</p>
        <p>5. Trigger 412 error (backup prerequisite failed)</p>
        <p>6. Verify user sees "Backup required" message</p>
      </div>

      <h3>5. String Safety Testing</h3>
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
        <p><strong>Test Case: Null/undefined string operations</strong></p>
        <p>1. Test search functionality with null/undefined values</p>
        <p>2. Test filtering with empty or malformed data</p>
        <p>3. Verify no runtime errors occur</p>
        <p>4. Verify safe utility functions handle edge cases</p>
      </div>

      <h3>6. End-to-End Security Flow</h3>
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
        <p><strong>Complete Security Test Scenario</strong></p>
        <p>1. Login as admin user</p>
        <p>2. Navigate to Settings page</p>
        <p>3. Initiate data wipe process</p>
        <p>4. Verify backup status check</p>
        <p>5. Perform step-up authentication</p>
        <p>6. Type confirmation phrase correctly</p>
        <p>7. Execute wipe operation</p>
        <p>8. Verify audit log entry is created</p>
        <p>9. Verify operation completes successfully</p>
        <p>10. Check that duplicate request returns cached result</p>
      </div>

      <h3>7. Automated Test Implementation</h3>
      <p>For comprehensive testing, implement automated tests using:</p>
      <ul>
        <li><strong>Unit Tests:</strong> Test individual security utilities and functions</li>
        <li><strong>Integration Tests:</strong> Test API endpoints with different user roles</li>
        <li><strong>E2E Tests:</strong> Test complete user workflows with Playwright/Cypress</li>
      </ul>

      <h4>Sample Playwright Test Structure</h4>
      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
        <pre>{`// tests/admin-access.spec.js
import { test, expect } from '@playwright/test';

test.describe('Admin Access Control', () => {
  test('non-admin cannot access admin pages', async ({ page }) => {
    // Login as non-admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'operator@test.com');
    // ... login flow
    
    // Verify admin nav is hidden
    await expect(page.locator('[data-testid="system-nav"]')).toBeHidden();
    
    // Try direct navigation
    await page.goto('/settings');
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });
  
  test('admin step-up authentication flow', async ({ page }) => {
    // Login as admin and test complete wipe flow
    // ... implementation
  });
});`}</pre>
      </div>

      <h3>8. Performance & Security Monitoring</h3>
      <p>In production, monitor:</p>
      <ul>
        <li><strong>Failed Authentication Attempts:</strong> Watch for brute force attacks</li>
        <li><strong>Privilege Escalation Attempts:</strong> Monitor 403 errors for unauthorized access</li>
        <li><strong>Audit Log Growth:</strong> Ensure audit logs don't impact performance</li>
        <li><strong>Step-Up Token Usage:</strong> Monitor for unusual patterns</li>
      </ul>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="text-green-800 font-semibold">Security Testing Checklist</h4>
        <ul className="text-green-700 mt-2 space-y-1">
          <li>✓ Non-admin users cannot access admin features</li>
          <li>✓ Deep-link protection prevents unauthorized access</li>
          <li>✓ Step-up authentication is required for destructive operations</li>
          <li>✓ Backup prerequisites are enforced</li>
          <li>✓ All privileged actions are audited with complete context</li>
          <li>✓ Idempotency prevents duplicate operations</li>
          <li>✓ Error messages are informative but secure</li>
          <li>✓ String operations handle null/undefined safely</li>
          <li>✓ Token expiration and validation work correctly</li>
          <li>✓ Audit trail is tamper-proof and exportable</li>
        </ul>
      </div>
    </div>
  );
}