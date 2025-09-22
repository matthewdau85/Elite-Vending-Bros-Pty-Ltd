import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show the banner if consent hasn't been given or denied
    const consent = localStorage.getItem('analytics_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (consent) => {
    localStorage.setItem('analytics_consent', consent);
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-4 z-50 animate-slide-up-fade">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Cookie className="w-6 h-6 mt-1 text-blue-300" />
          <div>
            <h3 className="font-semibold">We value your privacy</h3>
            <p className="text-sm text-slate-300">
              We use cookies and analytics to improve your experience. This helps us understand how our app is used and make it better for you.
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Button variant="outline" onClick={() => handleConsent('denied')} className="text-white border-slate-500 hover:bg-slate-700">
            Decline
          </Button>
          <Button onClick={() => handleConsent('granted')} className="bg-blue-600 hover:bg-blue-700">
            Accept
          </Button>
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up-fade {
          animation: slide-up-fade 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}