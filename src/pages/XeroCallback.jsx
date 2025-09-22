import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { completeXeroConnection } from '@/api/functions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function XeroCallback() {
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Completing Xero connection...');
    const [debugLog, setDebugLog] = useState([]);
    const navigate = useNavigate();

    const addDebugLog = (msg) => {
        console.log('XeroCallback:', msg);
        setDebugLog(prev => [...prev, `${new Date().toISOString()}: ${msg}`]);
    };

    useEffect(() => {
        const handleCallback = async () => {
            try {
                addDebugLog('Starting callback processing');
                
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                const error = urlParams.get('error');
                
                addDebugLog(`URL params - code: ${code ? 'present' : 'missing'}, state: ${state ? 'present' : 'missing'}, error: ${error || 'none'}`);

                if (error) {
                    setStatus('error');
                    setMessage(`Xero authorization failed: ${error}`);
                    return;
                }

                if (!code || !state) {
                    setStatus('error');
                    setMessage('Missing authorization code or state parameter.');
                    return;
                }

                addDebugLog('About to call completeXeroConnection');
                const response = await completeXeroConnection({ code, state });
                addDebugLog(`Function response: ${JSON.stringify(response)}`);
                
                if (response.data && response.data.success) {
                    setStatus('success');
                    setMessage(`Successfully connected to ${response.data.tenant_name}!`);
                    addDebugLog('SUCCESS: Connection established');
                    
                    // Clean up
                    sessionStorage.removeItem('xero_oauth_state');
                    
                    // MUCH longer delay so you can read the debug log
                    addDebugLog('Will redirect to Finance page in 10 seconds...');
                    setTimeout(() => {
                        navigate(createPageUrl('Finance'));
                    }, 10000); // 10 seconds instead of 3
                } else {
                    throw new Error(response.data?.error || 'Connection failed - no success flag');
                }
            } catch (error) {
                addDebugLog(`Error occurred: ${error.message}`);
                console.error('Xero callback error:', error);
                setStatus('error');
                setMessage(`Connection failed: ${error.message}`);
            }
        };

        addDebugLog('Component mounted, starting callback process');
        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Xero Integration Debug</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <div className="flex justify-center">
                        {status === 'processing' && <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />}
                        {status === 'success' && <CheckCircle className="w-16 h-16 text-green-500" />}
                        {status === 'error' && <AlertCircle className="w-16 h-16 text-red-500" />}
                    </div>
                    
                    <h2 className={`text-2xl font-bold ${status === 'success' ? 'text-green-700' : status === 'error' ? 'text-red-700' : 'text-blue-700'}`}>
                        {status === 'processing' && 'Connecting...'}
                        {status === 'success' && 'Connected!'}
                        {status === 'error' && 'Connection Failed'}
                    </h2>
                    
                    <p className="text-lg text-slate-600">{message}</p>
                    
                    {status === 'success' && (
                        <p className="text-slate-500 text-lg font-semibold">
                            🎉 SUCCESS! Redirecting in 10 seconds...
                        </p>
                    )}
                    
                    {status === 'error' && (
                        <button
                            onClick={() => navigate(createPageUrl('Finance'))}
                            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
                        >
                            Return to Finance
                        </button>
                    )}

                    {/* Debug Log - Much More Prominent */}
                    <div className="mt-8 text-left border-2 border-blue-200 rounded-lg">
                        <div className="bg-blue-100 px-4 py-2 border-b border-blue-200">
                            <h3 className="font-bold text-lg text-blue-800">Debug Log (Live Updates):</h3>
                        </div>
                        <div className="bg-white p-4 max-h-80 overflow-y-auto">
                            {debugLog.map((log, index) => (
                                <div key={index} className="mb-2 font-mono text-sm border-b border-gray-100 pb-1">
                                    {log}
                                </div>
                            ))}
                            {debugLog.length === 0 && (
                                <div className="text-gray-500 italic">Waiting for debug information...</div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}