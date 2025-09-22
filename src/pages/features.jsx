import React from 'react';
import RequireRole from '../components/auth/RequireRole';
import FeatureManagement from '../components/features/FeatureManagement';

export default function FeaturesPage() {
  return (
    <RequireRole requiredRole="admin">
      <FeatureManagement />
    </RequireRole>
  );
}