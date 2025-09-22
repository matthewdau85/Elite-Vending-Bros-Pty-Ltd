
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Added Textarea import
import { Loader2, MapPin } from "lucide-react";
import { getMapsApiKey } from '@/api/functions';

export default function AddLocationDialog({ open, onClose, onLocationAdded }) { // Renamed onSubmit to onLocationAdded
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
    location_type: "office",
    status: "active",
    latitude: null,
    longitude: null
  });
  const [isLoading, setIsLoading] = useState(false); // Replaced isSubmitting with isLoading
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear geocode result if address changes
    if (field === 'address') {
      setGeocodeResult(null);
      setFormData(prev => ({ ...prev, latitude: null, longitude: null }));
    }
  };

  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) return;
    
    setIsGeocoding(true);
    try {
      const response = await getMapsApiKey();
      if (!response.data?.success) {
        throw new Error('Failed to get API key');
      }

      // Load geocoding service if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${response.data.apiKey}`;
        script.onload = () => performGeocode();
        document.head.appendChild(script);
      } else {
        performGeocode();
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodeResult({ success: false, error: error.message });
    } finally {
      setIsGeocoding(false);
    }
  };

  const performGeocode = () => {
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address: formData.address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
        
        setGeocodeResult({
          success: true,
          formatted_address: results[0].formatted_address,
          coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      } else {
        setGeocodeResult({
          success: false,
          error: `Geocoding failed: ${status}. Please check the address.`
        });
      }
      setIsGeocoding(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Changed setIsSubmitting to setIsLoading
    
    try {
      await onLocationAdded(formData); // Changed onSubmit to onLocationAdded
      // Reset form
      setFormData({
        name: "", address: "", contact_person: "", contact_phone: "", 
        contact_email: "", location_type: "office", status: "active",
        latitude: null, longitude: null
      });
      setGeocodeResult(null);
    } catch (error) {
      console.error("Failed to add location:", error);
      alert("There was an error adding the location.");
    }
    setIsLoading(false); // Changed setIsSubmitting to setIsLoading
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Enter the details for the new vending machine location. We'll automatically find the coordinates for mapping.
          </DialogDescription>
        </DialogHeader>
        
        <form id="add-location-form" onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Location Name *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => handleChange("name", e.target.value)} 
                required 
                placeholder="e.g., Office Building A, University Campus"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Address *</Label>
              <div className="flex gap-2">
                <Input 
                  id="address" 
                  value={formData.address} 
                  onChange={(e) => handleChange("address", e.target.value)} 
                  required 
                  placeholder="123 Business Street, City, State, Postcode"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeocodeAddress}
                  disabled={!formData.address.trim() || isGeocoding}
                >
                  {isGeocoding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Geocoding result display */}
              {geocodeResult && (
                <div className={`p-3 rounded-lg text-sm ${
                  geocodeResult.success 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {geocodeResult.success ? (
                    <div>
                      <p className="font-medium">✓ Address found and mapped</p>
                      <p className="text-xs mt-1">Coordinates: {geocodeResult.coordinates}</p>
                    </div>
                  ) : (
                    <p>{geocodeResult.error}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input 
                id="contact_person" 
                value={formData.contact_person} 
                onChange={(e) => handleChange("contact_person", e.target.value)} 
                placeholder="Site contact name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input 
                id="contact_phone" 
                type="tel" 
                value={formData.contact_phone} 
                onChange={(e) => handleChange("contact_phone", e.target.value)} 
                placeholder="+61 2 1234 5678"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input 
                id="contact_email" 
                type="email" 
                value={formData.contact_email} 
                onChange={(e) => handleChange("contact_email", e.target.value)} 
                placeholder="contact@location.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location_type">Location Type</Label>
              <Select value={formData.location_type} onValueChange={(value) => handleChange("location_type", value)}>
                <SelectTrigger id="location_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office Building</SelectItem>
                  <SelectItem value="university">University/School</SelectItem>
                  <SelectItem value="hospital">Hospital/Medical</SelectItem>
                  <SelectItem value="factory">Factory/Industrial</SelectItem>
                  <SelectItem value="retail">Retail/Shopping</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending Setup</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            form="add-location-form" 
            disabled={isLoading} // Changed isSubmitting to isLoading
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} {/* Changed isSubmitting to isLoading */}
            {isLoading ? "Adding..." : "Add Location"} {/* Changed isSubmitting to isLoading */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
