import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function InstallPrompt({ installPromptEvent, onInstall }) {
  if (!installPromptEvent) {
    return null;
  }

  const handleInstallClick = () => {
    installPromptEvent.prompt();
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      onInstall();
    });
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
            <CardTitle>Install The App</CardTitle>
            <CardDescription>
                For the best experience, install the Elite Vending Bros app on your device.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleInstallClick} className="w-full bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4" />
                Install App
            </Button>
            <p className="text-xs text-slate-500 mt-3 text-center">
                Get faster access and offline capabilities.
            </p>
        </CardContent>
    </Card>
  );
}