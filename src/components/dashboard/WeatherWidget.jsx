import React, { useState, useEffect } from 'react';
import { WeatherData } from '@/api/entities';
import { Location } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Thermometer, Droplet, Wind, Cloud, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';

const WeatherIcon = ({ iconCode }) => {
    if (!iconCode) return <Cloud className="w-12 h-12 text-slate-400" />;
    return (
        <img 
            src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`} 
            alt="weather icon"
            className="w-16 h-16"
        />
    );
};

export default function WeatherWidget() {
    const [weatherData, setWeatherData] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [weather, locs] = await Promise.all([
                    WeatherData.list('-timestamp_hour', 50),
                    Location.list()
                ]);
                setWeatherData(weather);
                setLocations(locs);
                if (locs.length > 0) {
                    setSelectedLocationId(locs[0].id);
                }
            } catch (error) {
                console.error("Failed to load weather data:", error);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const selectedWeather = weatherData.find(w => w.location_id === selectedLocationId);
    const selectedLocation = locations.find(l => l.id === selectedLocationId);

    if (isLoading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-24 w-full" /></CardContent>
            </Card>
        );
    }
    
    if (locations.length === 0) {
      return (
        <Card>
          <CardHeader><CardTitle>Weather</CardTitle></CardHeader>
          <CardContent className="text-center text-slate-500">
            <MapPin className="mx-auto h-8 w-8 mb-2 text-slate-400" />
            <p>Add locations to see weather information.</p>
          </CardContent>
        </Card>
      );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Weather</CardTitle>
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a location..." />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map(loc => (
                            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                {selectedWeather ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selectedLocationId}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-4xl font-bold">{Math.round(selectedWeather.temperature_c)}°C</p>
                                <p className="text-slate-600 capitalize">{selectedWeather.weather_condition}</p>
                                <p className="text-sm text-slate-500">Feels like {Math.round(selectedWeather.feels_like_c)}°C</p>
                            </div>
                            <WeatherIcon iconCode={selectedWeather.weather_icon} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                            <div className="flex flex-col items-center">
                                <Droplet className="w-5 h-5 text-blue-500" />
                                <p className="font-bold">{Math.round(selectedWeather.humidity_percent)}%</p>
                                <p className="text-xs text-slate-500">Humidity</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <Wind className="w-5 h-5 text-slate-500" />
                                <p className="font-bold">{Math.round(selectedWeather.wind_kph)} kph</p>
                                <p className="text-xs text-slate-500">Wind</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <Cloud className="w-5 h-5 text-gray-500" />
                                <p className="font-bold">{Math.round(selectedWeather.cloud_cover_percent)}%</p>
                                <p className="text-xs text-slate-500">Cloud</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <p>No weather data available for {selectedLocation?.name}.</p>
                        <p className="text-xs mt-1">Try running the weather fetch function.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}