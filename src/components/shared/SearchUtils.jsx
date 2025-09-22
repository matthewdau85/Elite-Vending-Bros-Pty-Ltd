// Import from the corrected safe utilities including new array methods
import { 
  safeIncludes, 
  safeLower, 
  safeUpper, 
  safeTrim, 
  safeString, 
  safeGet, 
  safeArray,
  safeObject,
  safeNumber,
  safeBool,
  safeSome,
  safeEvery,
  safeFilter,
  safeMap,
  safeFind
} from "../utils/safe";

// Legacy exports for backward compatibility
export const safeStringIncludes = (str, searchTerm) => {
  return safeIncludes(str, searchTerm);
};

// Export all safe utilities including new array methods
export { 
  safeIncludes, 
  safeLower, 
  safeUpper, 
  safeTrim, 
  safeString, 
  safeGet, 
  safeArray,
  safeObject,
  safeNumber,
  safeBool,
  safeSome,
  safeEvery,
  safeFilter,
  safeMap,
  safeFind
};