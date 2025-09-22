
import { safeString } from "../utils/safe";

// Inlined 'clsx' to resolve module not found error
function clsx(...inputs) {
  let str = '';
  let i = 0;
  
  while (i < inputs.length) {
    const arg = inputs[i++];
    if (arg) {
      if (typeof arg === 'string' || typeof arg === 'number') {
        str += (str ? ' ' : '') + arg;
      } else if (Array.isArray(arg)) {
        if (arg.length) {
          const inner = clsx(...arg);
          if (inner) {
            str += (str ? ' ' : '') + inner;
          }
        }
      } else if (typeof arg === 'object') {
        for (const key in arg) {
          if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key]) {
            str += (str ? ' ' : '') + key;
          }
        }
      }
    }
  }
  return str;
}

// Function to combine and merge Tailwind CSS classes
export function cn(...inputs) {
  // Directly return the result of clsx instead of using twMerge
  return clsx(...inputs);
}

// **FIXED**: Made this function safe to prevent .includes errors
export const getStatusColor = (status) => {
  const safeStatus = safeString(status).toLowerCase();
  
  if (safeStatus.includes("online") || safeStatus.includes("active") || safeStatus.includes("completed") || safeStatus.includes("paid")) {
    return "bg-green-500";
  }
  if (safeStatus.includes("offline") || safeStatus.includes("inactive") || safeStatus.includes("retired")) {
    return "bg-slate-500";
  }
  if (safeStatus.includes("maintenance") || safeStatus.includes("acknowledged") || safeStatus.includes("in_progress") || safeStatus.includes("pending")) {
    return "bg-amber-500";
  }
  if (safeStatus.includes("critical") || safeStatus.includes("failed") || safeStatus.includes("jam")) {
    return "bg-red-500";
  }
  return "bg-gray-400"; // Default color
};

// **FIXED**: Made this function safe to prevent .includes errors
export const getPriorityColor = (priority) => {
  const safePriority = safeString(priority).toLowerCase();

  switch (safePriority) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};
