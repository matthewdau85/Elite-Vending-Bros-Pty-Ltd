import React from 'react';
import GoogleMapTest from '../components/maps/GoogleMapTest';

export default function MapTest() {
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Google Maps API Test</h1>
          <p className="text-slate-600 mt-1">
            Verify your Google Maps integration is working correctly before adding it to your locations and routes.
          </p>
        </div>
        
        <GoogleMapTest />
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What should you see?</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• An interactive map centered on Sydney CBD</li>
            <li>• A green marker showing a test vending machine location</li>
            <li>• "Maps API loaded successfully" status message</li>
            <li>• Working "Test Geocoding" button that adds a blue marker at Sydney Opera House</li>
          </ul>
          
          <div className="mt-4">
            <h4 className="font-semibold text-blue-900">If you see errors:</h4>
            <ul className="text-blue-700 text-sm space-y-1 mt-1">
              <li>1. Check that your API key is correctly set in the secrets</li>
              <li>2. Verify you've enabled "Maps JavaScript API" and "Geocoding API" in Google Cloud Console</li>
              <li>3. Confirm the domain restriction is set to: <code className="bg-white px-1 rounded">elitevendingbros.base44.app/*</code></li>
              <li>4. Make sure billing is enabled on your Google Cloud project</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}