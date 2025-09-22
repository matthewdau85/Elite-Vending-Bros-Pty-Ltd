import React from 'react';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import { useCurrentUser } from '../components/auth/useCurrentUser';
import { Navigate } from 'react-router-dom';

export default function OnboardingPage() {
    const { user, isLoading } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your profile...</p>
                </div>
            </div>
        );
    }
    
    // If onboarding is complete, don't show this page
    if (user && user.onboarding_completed) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <OnboardingWizard />
        </div>
    );
}