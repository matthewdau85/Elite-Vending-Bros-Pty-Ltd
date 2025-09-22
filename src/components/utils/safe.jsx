// Production-safe utility functions to prevent crashes
export const safeLower = (v) => {
  try {
    if (v === null || v === undefined) return "";
    return String(v).toLowerCase();
  } catch (e) {
    console.warn("safeLower error:", e);
    return "";
  }
};

export const safeUpper = (v) => {
  try {
    if (v === null || v === undefined) return "";
    return String(v).toUpperCase();
  } catch (e) {
    console.warn("safeUpper error:", e);
    return "";
  }
};

export const safeTrim = (v) => {
  try {
    if (v === null || v === undefined) return "";
    return String(v).trim();
  } catch (e) {
    console.warn("safeTrim error:", e);
    return "";
  }
};

export const safeString = (v) => {
  try {
    if (v === null || v === undefined) return "";
    return String(v);
  } catch (e) {
    console.warn("safeString error:", e);
    return "";
  }
};

export const safeArray = (v) => {
  try {
    return Array.isArray(v) ? v : [];
  } catch (e) {
    console.warn("safeArray error:", e);
    return [];
  }
};

export const safeObject = (v) => {
  try {
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch (e) {
    console.warn("safeObject error:", e);
    return {};
  }
};

export const safeNumber = (v) => {
  try {
    if (v === null || v === undefined) return 0;
    const parsed = parseFloat(v);
    return isNaN(parsed) ? 0 : parsed;
  } catch (e) {
    console.warn("safeNumber error:", e);
    return 0;
  }
};

export const safeBool = (v) => {
  try {
    return Boolean(v);
  } catch (e) {
    console.warn("safeBool error:", e);
    return false;
  }
};

// CRITICAL: Safe includes function that prevents all undefined errors
export const safeIncludes = (str, searchTerm) => {
  try {
    // If no search term, return true (show all)
    if (!searchTerm || searchTerm === "" || searchTerm === null || searchTerm === undefined) return true;
    
    // Convert both to safe strings
    const safeStr = safeString(str);
    const safeSearchTerm = safeString(searchTerm);
    
    // Perform case-insensitive search
    return safeStr.toLowerCase().includes(safeSearchTerm.toLowerCase());
  } catch (e) {
    console.warn("safeIncludes error:", e, "str:", str, "searchTerm:", searchTerm);
    return false;
  }
};

// NEW: Safe array methods to prevent undefined errors
export const safeSome = (arr, callback) => {
  try {
    const safeArr = safeArray(arr);
    return safeArr.some(callback);
  } catch (e) {
    console.warn("safeSome error:", e);
    return false;
  }
};

export const safeEvery = (arr, callback) => {
  try {
    const safeArr = safeArray(arr);
    return safeArr.every(callback);
  } catch (e) {
    console.warn("safeEvery error:", e);
    return true;
  }
};

export const safeFilter = (arr, callback) => {
  try {
    const safeArr = safeArray(arr);
    return safeArr.filter(callback);
  } catch (e) {
    console.warn("safeFilter error:", e);
    return [];
  }
};

export const safeMap = (arr, callback) => {
  try {
    const safeArr = safeArray(arr);
    return safeArr.map(callback);
  } catch (e) {
    console.warn("safeMap error:", e);
    return [];
  }
};

export const safeFind = (arr, callback) => {
  try {
    const safeArr = safeArray(arr);
    return safeArr.find(callback);
  } catch (e) {
    console.warn("safeFind error:", e);
    return undefined;
  }
};

// Safe property access
export const safeGet = (obj, path, defaultValue = null) => {
  try {
    if (!obj || !path) return defaultValue;
    const keys = String(path).split('.');
    let current = obj;
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    return current;
  } catch (e) {
    console.warn("safeGet error:", e);
    return defaultValue;
  }
};

// Additional safe operations
export const count = (v) => {
  try {
    if (Array.isArray(v)) return v.length;
    if (v && typeof v.length === 'number') return v.length;
    return 0;
  } catch (e) {
    console.warn("count error:", e);
    return 0;
  }
};

export const has = (v, x) => {
  try {
    if (!v || x === null || x === undefined) return false;
    if (Array.isArray(v)) return v.includes(x);
    return safeIncludes(v, x);
  } catch (e) {
    console.warn("has error:", e);
    return false;
  }
};