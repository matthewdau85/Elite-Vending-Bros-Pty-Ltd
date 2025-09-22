import { format } from 'date-fns';

// Number formatting utilities
export const formatNumber = (num, options = {}) => {
  if (num === null || num === undefined) return '0';
  
  const {
    compact = false,
    currency = false,
    decimals = 0,
    locale = 'en-AU'
  } = options;

  const formatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  };

  if (currency) {
    formatOptions.style = 'currency';
    formatOptions.currency = 'AUD';
  }

  if (compact && Math.abs(num) >= 1000) {
    formatOptions.notation = 'compact';
    formatOptions.compactDisplay = 'short';
  }

  return new Intl.NumberFormat(locale, formatOptions).format(num);
};

// Currency formatting
export const formatCurrency = (amount, compact = false) => {
  return formatNumber(amount, { currency: true, compact, decimals: 2 });
};

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  return `${formatNumber(value, { decimals })}%`;
};

// CSV Export helpers
export const exportToCSV = (data, filename, headers = null) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Auto-generate headers from first object keys if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        let value = row[header];
        
        // Handle different data types
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'string' && value.includes(',')) {
          value = `"${value.replace(/"/g, '""')}"`;
        } else if (value instanceof Date) {
          value = format(value, 'yyyy-MM-dd HH:mm:ss');
        }
        
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Chart color palette
export const chartColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
  purple: '#9333ea',
  pink: '#e11d48',
};

// Chart theme configuration
export const chartTheme = {
  colors: Object.values(chartColors),
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  grid: {
    stroke: '#f1f5f9',
    strokeWidth: 1,
  },
  axis: {
    stroke: '#64748b',
    fontSize: 11,
  },
  tooltip: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
  }
};