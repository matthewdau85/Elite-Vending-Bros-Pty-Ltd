import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { setupMockData } from '@/api/functions';
import { completeOnboarding } from '@/api/functions';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, Coffee, Rocket, Check } from 'lucide-react';

const STEPS = ["Welcome", "Location", "First Machine", "Data Setup", "Finish"];

export default function OnboardingWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [location, setLocation] = useState({ name: '', address: '' });
    const [machine, setMachine] = useState({ machine_id: '', model: '' });

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinish = async (useMocks) => {
        setIsLoading(true);
        try {
            if (useMocks) {
                await setupMockData();
                toast.success("Sample data has been generated for you!");
            }
            
            // In a real app, you'd save the location & machine data here.
            // For now, we just complete the onboarding.
            await completeOnboarding({ location, machine, useMocks });

            toast.success("Onboarding complete! Welcome aboard.");
            navigate('/dashboard');

        } catch (error) {
            toast.error("An error occurred during setup. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="text-center">
                        <Rocket className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Welcome to Elite Vending Bros!</h2>
                        <p className="text-slate-600">Let's get your operation set up in just a few minutes.</p>
                    </div>
                );
            case 1:
                return (
                    <div>
                        <MapPin className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                        <h3 className="text-xl font-semibold text-center mb-4">Add Your First Location</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="loc-name">Location Name</Label>
                                <Input id="loc-name" placeholder="e.g., Office Building A" value={location.name} onChange={(e) => setLocation({...location, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="loc-address">Address</Label>
                                <Input id="loc-address" placeholder="123 Example St, Sydney" value={location.address} onChange={(e) => setLocation({...location, address: e.target.value})} />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <Coffee className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                        <h3 className="text-xl font-semibold text-center mb-4">Add Your First Machine</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="machine-id">Machine ID</Label>
                                <Input id="machine-id" placeholder="e.g., EVB-001" value={machine.machine_id} onChange={(e) => setMachine({...machine, machine_id: e.target.value})}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="machine-model">Machine Model</Label>
                                <Input id="machine-model" placeholder="e.g., Seaga SM23" value={machine.model} onChange={(e) => setMachine({...machine, model: e.target.value})}/>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="text-center">
                        <Zap className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Instant Demo or Live Data?</h3>
                        <p className="text-slate-600 mb-6">You can start with sample data to explore, or connect your live accounts now.</p>
                        <div className="flex flex-col gap-4">
                            <Button size="lg" onClick={() => handleFinish(true)} disabled={isLoading}>
                                {isLoading ? "Setting up..." : "🚀 Use Sample Data & Finish"}
                            </Button>
                            <Separator />
                            <Button size="lg" variant="outline" disabled={true}>
                                Connect Live Accounts (Coming Soon)
                            </Button>
                        </div>
                    </div>
                );
            case 4:
                 return (
                    <div className="text-center">
                        <Check className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">All Set!</h2>
                        <p className="text-slate-600">Click finish to jump into your new dashboard.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader>
                <CardTitle>Onboarding</CardTitle>
                <CardDescription>Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}</CardDescription>
                <div className="flex w-full h-1 bg-slate-200 rounded-full mt-2">
                    <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="min-h-[250px] flex items-center justify-center">
                {renderStepContent()}
            </CardContent>
            <div className="p-6 flex justify-between">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isLoading}>
                    Back
                </Button>
                {currentStep < 3 && (
                    <Button onClick={handleNext} disabled={isLoading}>
                        Next
                    </Button>
                )}
                {currentStep === 4 && (
                     <Button onClick={() => handleFinish(false)} disabled={isLoading}>
                        {isLoading ? "Finishing..." : "Finish"}
                    </Button>
                )}
            </div>
        </Card>
    );
}