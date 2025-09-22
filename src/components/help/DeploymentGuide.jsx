import React from 'react';

const CodeBlock = ({ children }) => (
    <pre className="bg-slate-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
        <code>{children}</code>
    </pre>
);

export default function DeploymentGuide() {
  const nginxConfig = `
server {
    # ... other server configs

    # Add Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Content Security Policy (CSP)
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:; frame-ancestors 'none';" always;

    # ... location block
}
  `;

  return (
    <div className="prose prose-slate max-w-none">
      <h2>Deployment Guide</h2>
      <p>To protect the application against common web vulnerabilities like cross-site scripting (XSS) and clickjacking, a strict set of security headers should be applied at the web server or load balancer level.</p>
      
      <h3>NGINX Configuration Example</h3>
      <p>If deploying as a static site behind an NGINX reverse proxy, add these headers to your `server` block.</p>
      <CodeBlock>{nginxConfig.trim()}</CodeBlock>

      <h4>Important Notes</h4>
      <ul>
        <li><strong>CSP Tuning:</strong> The provided Content Security Policy (CSP) is a strong starting point. You may need to add specific domains if you load assets (fonts, scripts) from CDNs.</li>
        <li><strong>`'unsafe-inline'` for styles:</strong> This is often required for modern JavaScript UI libraries. While not ideal, it's a common trade-off. Avoid it if possible.</li>
        <li><strong>Testing:</strong> Always test your security headers in a staging environment before deploying to production, as an overly restrictive policy can break application functionality.</li>
      </ul>
    </div>
  );
}