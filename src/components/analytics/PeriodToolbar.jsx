import React, { useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { format, subDays, startOfYear, endOfDay, startOfDay } from 'date-fns';
import { toast } from 'sonner';

// Date range presets with comparison logic
const DATE_PRESETS = [
  { 
    label: '7 days', 
    value: '7d',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
      comparison: {
        from: startOfDay(subDays(new Date(), 13)),
        to: endOfDay(subDays(new Date(), 7))
      }
    })
  },
  { 
    label: '30 days', 
    value: '30d',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
      comparison: {
        from: startOfDay(subDays(new Date(), 59)),
        to: endOfDay(subDays(new Date(), 30))
      }
    })
  },
  { 
    label: '90 days', 
    value: '90d',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 89)),
      to: endOfDay(new Date()),
      comparison: {
        from: startOfDay(subDays(new Date(), 179)),
        to: endOfDay(subDays(new Date(), 90))
      }
    })
  },
  { 
    label: 'Year to date', 
    value: 'ytd',
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfDay(new Date()),
      comparison: {
        from: startOfYear(subDays(startOfYear(new Date()), 1)),
        to: endOfDay(subDays(startOfYear(new Date()), 1))
      }
    })
  }
];

// Context for period state management
const PeriodContext = createContext();

export const PeriodProvider = ({ children }) => {
  const [selectedPreset, setSelectedPreset] = useState('30d');
  const [dateRange, setDateRange] = useState(() => {
    const preset = DATE_PRESETS.find(p => p.value === '30d');
    return preset.getRange();
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const updatePeriod = (presetValue) => {
    setSelectedPreset(presetValue);
    const preset = DATE_PRESETS.find(p => p.value === presetValue);
    if (preset) {
      const range = preset.getRange();
      setDateRange(range);
    }
  };

  const updateCustomRange = (range) => {
    if (range?.from && range?.to) {
      // Calculate comparison period of same length
      const daysDiff = Math.abs(range.to - range.from) / (1000 * 60 * 60 * 24);
      const comparisonEnd = startOfDay(range.from);
      const comparisonStart = startOfDay(subDays(comparisonEnd, daysDiff));
      
      setDateRange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
        comparison: {
          from: comparisonStart,
          to: endOfDay(comparisonEnd)
        }
      });
      setSelectedPreset('custom');
      setIsCalendarOpen(false);
    }
  };

  return (
    <PeriodContext.Provider value={{
      selectedPreset,
      dateRange,
      updatePeriod,
      updateCustomRange,
      isCalendarOpen,
      setIsCalendarOpen
    }}>
      {children}
    </PeriodContext.Provider>
  );
};

export const usePeriod = () => {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error('usePeriod must be used within a PeriodProvider');
  }
  return context;
};

// Comparison indicator component
export const ComparisonIndicator = ({ current, previous, format = 'number' }) => {
  if (!previous || previous === 0) return null;
  
  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;
  
  const formatValue = (value) => {
    if (format === 'currency') return `$${value.toLocaleString()}`;
    if (format === 'percentage') return `${value.toFixed(1)}%`;
    return value.toLocaleString();
  };
  
  return (
    <div className={`flex items-center gap-1 text-sm ${
      isPositive ? 'text-green-600' : 'text-red-600'
    }`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span className="font-medium">{Math.abs(change).toFixed(1)}%</span>
      <span className="text-slate-500">vs prev period</span>
    </div>
  );
};

export default function PeriodToolbar({
  onExportCsv,
  exportLabel = "Export Data",
  showExport = true,
  additionalFilters = null,
  className = ""
}) {
  const { 
    selectedPreset, 
    dateRange, 
    updatePeriod, 
    updateCustomRange, 
    isCalendarOpen, 
    setIsCalendarOpen 
  } = usePeriod();

  const handleExport = async () => {
    try {
      await onExportCsv?.(dateRange);
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    }
  };

  const formatDateRange = () => {
    if (!dateRange?.from || !dateRange?.to) return 'Select dates';
    
    if (format(dateRange.from, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')) {
      return format(dateRange.from, 'MMM d, yyyy');
    }
    
    return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
  };

  return (
    <Card className={`mb-6 ${className}`}>
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Period Presets */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <div className="flex gap-1">
                {DATE_PRESETS.map(preset => (
                  <Button
                    key={preset.value}
                    variant={selectedPreset === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePeriod(preset.value)}
                    className="h-8"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date Picker */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`justify-start text-left font-normal h-8 ${
                    selectedPreset === 'custom' ? 'border-blue-300 bg-blue-50' : ''
                  }`}
                  onClick={() => setIsCalendarOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={updateCustomRange}
                  numberOfMonths={2}
                  defaultMonth={dateRange?.from}
                />
              </PopoverContent>
            </Popover>

            {/* Additional Filters */}
            {additionalFilters}
          </div>

          {/* Export Button */}
          {showExport && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {exportLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}