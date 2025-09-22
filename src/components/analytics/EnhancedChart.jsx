import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Enhanced number formatting
export const formatCompactNumber = (value, options = {}) => {
  const { currency = false, decimals = 1 } = options;
  
  if (value === 0) return currency ? '$0' : '0';
  
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const prefix = currency ? '$' : '';
  
  if (abs >= 1000000) {
    return `${sign}${prefix}${(abs / 1000000).toFixed(decimals)}M`;
  }
  if (abs >= 1000) {
    return `${sign}${prefix}${(abs / 1000).toFixed(decimals)}K`;
  }
  
  return `${sign}${prefix}${abs.toLocaleString()}`;
};

// Enhanced tooltip with comparisons
const CustomTooltip = ({ active, payload, label, formatValue, showComparison = false }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-48">
      <p className="font-semibold text-slate-900 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-slate-600">{entry.dataKey}</span>
          </div>
          <span className="text-sm font-medium text-slate-900">
            {formatValue ? formatValue(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
      {showComparison && payload[0]?.payload?.previous && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Previous: {formatValue ? formatValue(payload[0].payload.previous) : payload[0].payload.previous.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Line Chart
export const EnhancedLineChart = ({ 
  data, 
  dataKeys, 
  xAxisKey = 'date',
  height = 300,
  formatValue,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  showGrid = true,
  showLegend = true,
  showComparison = false,
  strokeWidth = 2
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
        <XAxis 
          dataKey={xAxisKey} 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickFormatter={(value) => formatCompactNumber(value, { currency: formatValue === 'currency' })}
        />
        <Tooltip 
          content={<CustomTooltip formatValue={formatValue} showComparison={showComparison} />}
        />
        {showLegend && window.innerWidth > 768 && (
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
        )}
        {dataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={strokeWidth}
            dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Enhanced Area Chart
export const EnhancedAreaChart = ({ 
  data, 
  dataKeys, 
  xAxisKey = 'date',
  height = 300,
  formatValue,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  showGrid = true,
  showLegend = true,
  stacked = false
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
        <XAxis 
          dataKey={xAxisKey} 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickFormatter={(value) => formatCompactNumber(value, { currency: formatValue === 'currency' })}
        />
        <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
        {showLegend && window.innerWidth > 768 && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
        {dataKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId={stacked ? "1" : undefined}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Enhanced Bar Chart
export const EnhancedBarChart = ({ 
  data, 
  dataKeys, 
  xAxisKey = 'name',
  height = 300,
  formatValue,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  showGrid = true,
  showLegend = true
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
        <XAxis 
          dataKey={xAxisKey} 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickFormatter={(value) => formatCompactNumber(value, { currency: formatValue === 'currency' })}
        />
        <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
        {showLegend && window.innerWidth > 768 && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// Sparkline component for mini charts
export const Sparkline = ({ data, dataKey, width = 60, height = 20, color = '#3b82f6' }) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};