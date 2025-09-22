import { 
  HelpCircle, 
  Gauge, 
  Server, 
  Route as RouteIcon, 
  Boxes, 
  ReceiptText, 
  Wrench, 
  MessageSquareWarning, 
  Users, 
  ChartLine, 
  Plug, 
  Activity, 
  KeyRound, 
  Flag, 
  Settings, 
  Sparkles, 
  LifeBuoy,
  Coffee,
  MapPin,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  FileText,
  Zap
} from 'lucide-react';

// Map of previously used icon names to components for backwards compatibility
const PREV_ICONS = {
  'Gauge': Gauge,
  'Server': Server,
  'Route': RouteIcon,
  'Boxes': Boxes,
  'ReceiptText': ReceiptText,
  'Wrench': Wrench,
  'MessageSquareWarning': MessageSquareWarning,
  'Users': Users,
  'ChartLine': ChartLine,
  'Plug': Plug,
  'Activity': Activity,
  'KeyRound': KeyRound,
  'Flag': Flag,
  'Settings': Settings,
  'Sparkles': Sparkles,
  'LifeBuoy': LifeBuoy,
  'Coffee': Coffee,
  'MapPin': MapPin,
  'DollarSign': DollarSign,
  'AlertTriangle': AlertTriangle,
  'TrendingUp': TrendingUp,
  'FileText': FileText,
  'Zap': Zap
};

const prevOr = (name) => {
  return PREV_ICONS[name];
};

const FALLBACK = HelpCircle;

export const icons = {
  dashboard: prevOr('Gauge') ?? Gauge,
  machines: prevOr('Server') ?? Server,
  routes: prevOr('Route') ?? RouteIcon,
  inventory: prevOr('Boxes') ?? Boxes,
  sales: prevOr('TrendingUp') ?? TrendingUp,
  finance: prevOr('DollarSign') ?? DollarSign,
  locations: prevOr('MapPin') ?? MapPin,
  alerts: prevOr('AlertTriangle') ?? AlertTriangle,
  refunds: prevOr('ReceiptText') ?? ReceiptText,
  tickets: prevOr('Wrench') ?? Wrench,
  complaints: prevOr('MessageSquareWarning') ?? MessageSquareWarning,
  customers: prevOr('Users') ?? Users,
  analytics: prevOr('ChartLine') ?? ChartLine,
  integrations: prevOr('Plug') ?? Plug,
  health: prevOr('Activity') ?? Activity,
  secrets: prevOr('KeyRound') ?? KeyRound,
  flags: prevOr('Flag') ?? Flag,
  settings: prevOr('Settings') ?? Settings,
  help: prevOr('LifeBuoy') ?? LifeBuoy ?? HelpCircle,
  whatsNew: prevOr('Sparkles') ?? Sparkles,
  aiinsights: prevOr('Zap') ?? Zap,
  aiagent: prevOr('Sparkles') ?? Sparkles,
  users: prevOr('Users') ?? Users,
  servicetickets: prevOr('Wrench') ?? Wrench,
  payments: prevOr('DollarSign') ?? DollarSign,
  telemetry: prevOr('Activity') ?? Activity,
  energy: prevOr('Zap') ?? Zap,
  features: prevOr('Flag') ?? Flag,
  developer: prevOr('FileText') ?? FileText,
  observability: prevOr('Activity') ?? Activity
};

export function getIcon(key) {
  const C = (key && icons[key]) || FALLBACK;
  
  // Only log warnings in development (avoid console noise in production)
  if (typeof window !== "undefined" && window.location?.hostname === "localhost") {
    if (key && !icons[key]) {
      // Soft warning only in dev
      // console.warn("[IconRegistry] Unknown icon key:", key);
    }
  }
  
  return C;
}