import React from 'react';
import { Smartphone, Wifi, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InstallPrompt from '../components/mobile/InstallPrompt';
import { useOutletContext } from 'react-router-dom';
import RequireRole from '../components/auth/RequireRole';
import { useFeatureGate } from '../components/features/useFeatureGate';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
        </div>
    </div>
);

export default function MobilePage() {
    // This hook gets the context passed from the Layout
    const { installPromptEvent, setInstallPromptEvent } = useOutletContext() || {};
    const { checkFlag } = useFeatureGate();
    const pwaEnabled = checkFlag('pwa.offline');

    const handleInstall = () => {
        if (setInstallPromptEvent) {
            setInstallPromptEvent(null);
        }
    };

    return (
        <RequireRole requiredRole="viewer">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Mobile & Offline Access</h1>
                    <p className="mt-2 text-lg text-slate-600">
                        Take your operations on the go with our mobile-optimized features.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Field App Features</CardTitle>
                        <CardDescription>
                            Enable powerful tools for your team in the field.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FeatureCard 
                            icon={Smartphone}
                            title="Installable App"
                            description="Add to your home screen for quick access, just like a native app."
                        />
                        <FeatureCard 
                            icon={Wifi}
                            title="Offline Access"
                            description="View routes, machine data, and service history even without an internet connection."
                        />
                        <FeatureCard 
                            icon={Zap}
                            title="Real-time Sync"
                            description="Data automatically syncs when you're back online, ensuring nothing is lost."
                        />
                         <FeatureCard 
                            icon={Zap}
                            title="Cash & Stock Management"
                            description="Log cash collections and stock refills directly from your mobile device."
                        />
                    </CardContent>
                </Card>
                
                {pwaEnabled ? (
                    <InstallPrompt 
                        installPromptEvent={installPromptEvent} 
                        onInstall={handleInstall} 
                    />
                ) : (
                    <Card className="text-center p-6 bg-slate-50">
                        <CardTitle>PWA Not Enabled</CardTitle>
                        <CardDescription className="mt-2">
                           The Progressive Web App features are currently disabled. Contact an administrator to enable them.
                        </CardDescription>
                    </Card>
                )}
            </div>
        </RequireRole>
    );
}